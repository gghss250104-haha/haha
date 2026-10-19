export type CharacterType = 'RBC' | 'WBC';
export type MapType = 'systemic' | 'pulmonary';
export type GameScreen = 'home' | 'matching' | 'racing' | 'spectating' | 'results';

export interface StudentProfile {
  id: string;
  nickname: string;
  passwordHash: string;
  totalRaces: number;
  wins: number;
  bestSystemicTime: number; // in seconds (0 = none)
  bestPulmonaryTime: number; // in seconds (0 = none)
  lastCharacter?: CharacterType;
  lastMap?: MapType;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerParticipant {
  id: string;
  nickname: string;
  character: CharacterType;
  isBot: boolean;
  avatarColor: string;
  progress: number; // 0 to 100%
  lane: number; // -1 (left), 0 (center), 1 (right)
  speed: number;
  boostActiveUntil?: number;
  boostCharges?: number;
  phagocytosisAvailable?: boolean;
  phagocytosisCount?: number;
  finished: boolean;
  finishTime?: number; // seconds
  rank?: number;
  currentStageName: string;
  oxygenSaturation: number; // 0 - 100%
}

export interface StageDefinition {
  name: string;
  koreanName: string;
  description: string;
  vesselType: 'artery' | 'capillary' | 'vein' | 'heart_chamber';
  oxygenated: boolean;
  wallColor: string;
  bloodColor: string;
  startProgress: number;
  endProgress: number;
}

export interface TrackItem {
  id: number;
  type: 'coin' | 'bacteria';
  progress: number; // 0 to 100%
  lane: number; // -1, 0, 1
  collected?: boolean;
  destroyed?: boolean;
}

export interface MatchRoomData {
  id: string;
  mapType: MapType;
  status: 'waiting' | 'racing' | 'finished';
  playerCount: number;
  players: string; // JSON string of PlayerParticipant[]
  createdAt: string;
  updatedAt: string;
}

export interface RankingRecord {
  id: string;
  studentId: string;
  nickname: string;
  mapType: MapType;
  character: CharacterType;
  finishTimeSeconds: number;
  createdAt: string;
}
