import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './error';
import { StudentProfile, RankingRecord, MapType, CharacterType } from '../types/game';
import { generateStudentId, hashPassword } from '../utils/hash';

const SESSION_STORAGE_KEY = 'circulatory_active_session_v1';

export interface SavedSession {
  studentId: string;
  nickname: string;
  password: string;
}

export function getSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: SavedSession | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
}

/**
 * Log in an existing student or create a new student account if first time.
 * Even if nicknames are the same, different passwords create distinct student accounts.
 */
export async function loginOrCreateStudent(
  nickname: string,
  password: string,
  character?: CharacterType,
  mapType?: MapType
): Promise<StudentProfile> {
  const cleanNickname = nickname.trim().slice(0, 30);
  const cleanPassword = password.trim();

  if (!cleanNickname || !cleanPassword) {
    throw new Error('닉네임과 비밀번호를 모두 입력해주세요.');
  }

  const studentId = await generateStudentId(cleanNickname, cleanPassword);
  const passwordHash = await hashPassword(cleanPassword);
  const studentDocRef = doc(db, 'students', studentId);

  try {
    const snap = await getDoc(studentDocRef);

    if (snap.exists()) {
      const data = snap.data() as StudentProfile;
      // Update last preferences and updatedAt
      const updated: Partial<StudentProfile> = {
        updatedAt: new Date().toISOString(),
        ...(character ? { lastCharacter: character } : {}),
        ...(mapType ? { lastMap: mapType } : {}),
      };
      await updateDoc(studentDocRef, updated);
      const fullProfile = { ...data, ...updated };
      saveSession({ studentId, nickname: cleanNickname, password: cleanPassword });
      return fullProfile;
    } else {
      // First-time user registration
      const newProfile: StudentProfile = {
        id: studentId,
        nickname: cleanNickname,
        passwordHash,
        totalRaces: 0,
        wins: 0,
        bestSystemicTime: 0,
        bestPulmonaryTime: 0,
        lastCharacter: character || 'RBC',
        lastMap: mapType || 'systemic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(studentDocRef, newProfile);
      saveSession({ studentId, nickname: cleanNickname, password: cleanPassword });
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${studentId}`);
  }
}

/**
 * Record race completion statistics for student
 */
export async function updateStudentStats(
  studentId: string,
  isWin: boolean,
  mapType: MapType,
  finishTimeSeconds: number,
  character: CharacterType
): Promise<void> {
  const studentDocRef = doc(db, 'students', studentId);
  try {
    const snap = await getDoc(studentDocRef);
    if (!snap.exists()) return;

    const data = snap.data() as StudentProfile;
    const newTotalRaces = (data.totalRaces || 0) + 1;
    const newWins = (data.wins || 0) + (isWin ? 1 : 0);

    let newBestSystemic = data.bestSystemicTime || 0;
    let newBestPulmonary = data.bestPulmonaryTime || 0;

    if (mapType === 'systemic') {
      if (newBestSystemic === 0 || finishTimeSeconds < newBestSystemic) {
        newBestSystemic = Math.round(finishTimeSeconds * 100) / 100;
      }
    } else {
      if (newBestPulmonary === 0 || finishTimeSeconds < newBestPulmonary) {
        newBestPulmonary = Math.round(finishTimeSeconds * 100) / 100;
      }
    }

    await updateDoc(studentDocRef, {
      totalRaces: newTotalRaces,
      wins: newWins,
      bestSystemicTime: newBestSystemic,
      bestPulmonaryTime: newBestPulmonary,
      lastCharacter: character,
      lastMap: mapType,
      updatedAt: new Date().toISOString(),
    });

    // Also record ranking entry if good finish
    const rankingId = `rank_${Date.now()}_${studentId.slice(4, 12)}`;
    await setDoc(doc(db, 'rankings', rankingId), {
      id: rankingId,
      studentId,
      nickname: data.nickname,
      mapType,
      character,
      finishTimeSeconds: Math.round(finishTimeSeconds * 100) / 100,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to update student stats in Firestore:', error);
  }
}

/**
 * Get top rankings for a map
 */
export async function getTopRankings(mapType: MapType, maxResults = 10): Promise<RankingRecord[]> {
  try {
    const q = query(
      collection(db, 'rankings'),
      where('mapType', '==', mapType),
      orderBy('finishTimeSeconds', 'asc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as RankingRecord);
  } catch (error) {
    console.warn('Could not load rankings from Firestore, fallback empty', error);
    return [];
  }
}
