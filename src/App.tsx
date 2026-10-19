/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CharacterType,
  MapType,
  GameScreen,
  StudentProfile,
  PlayerParticipant,
  TrackItem,
} from './types/game';
import {
  loginOrCreateStudent,
  getSavedSession,
  saveSession,
  updateStudentStats,
} from './firebase/services';
import { generateTrackItems, getCurrentStage } from './utils/circulationData';
import {
  playHeartbeat,
  playBoostSound,
  playPhagocytosisSound,
  playCoinSound,
  playBumpSound,
  setMuted,
  getMuted,
} from './utils/audio';

import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MatchingView } from './components/MatchingView';
import { RaceCanvas } from './components/RaceCanvas';
import { CirculationMap } from './components/CirculationMap';
import { ControlPad } from './components/ControlPad';
import { SpectatorView } from './components/SpectatorView';
import { ResultsView } from './components/ResultsView';
import { ScienceModal } from './components/ScienceModal';

export default function App() {
  // Navigation & User State
  const [screen, setScreen] = useState<GameScreen>('home');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('RBC');
  const [selectedMap, setSelectedMap] = useState<MapType>('systemic');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isScienceModalOpen, setIsScienceModalOpen] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Race State
  const [players, setPlayers] = useState<PlayerParticipant[]>([]);
  const [trackItems, setTrackItems] = useState<TrackItem[]>([]);
  const [currentLane, setCurrentLane] = useState<number>(0); // -1, 0, 1
  const [boostCharges, setBoostCharges] = useState<number>(0);
  const [boostActiveSeconds, setBoostActiveSeconds] = useState<number>(0);
  const [canPhagocytose, setCanPhagocytose] = useState<boolean>(false);
  const [raceElapsedSeconds, setRaceElapsedSeconds] = useState<number>(0);

  // References for main game loop
  const playersRef = useRef<PlayerParticipant[]>([]);
  playersRef.current = players;
  const trackItemsRef = useRef<TrackItem[]>([]);
  trackItemsRef.current = trackItems;
  const currentLaneRef = useRef<number>(0);
  currentLaneRef.current = currentLane;
  const boostSecRef = useRef<number>(0);
  boostSecRef.current = boostActiveSeconds;
  const raceStartTimeRef = useRef<number>(0);
  const finishOrderRef = useRef<string[]>([]);

  // 1. Restore saved session on initial boot
  useEffect(() => {
    setIsAudioMuted(getMuted());
    const saved = getSavedSession();
    if (saved) {
      setIsLoadingAuth(true);
      loginOrCreateStudent(saved.nickname, saved.password)
        .then(profile => {
          setCurrentStudent(profile);
          if (profile.lastCharacter) setSelectedCharacter(profile.lastCharacter);
          if (profile.lastMap) setSelectedMap(profile.lastMap);
        })
        .catch(err => {
          console.warn('Session auto-restore failed:', err);
          saveSession(null);
        })
        .finally(() => setIsLoadingAuth(false));
    }
  }, []);

  // Periodic heartbeat audio effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (screen === 'racing' || screen === 'spectating') {
        playHeartbeat();
      }
    }, boostActiveSeconds > 0 ? 800 : 1400);

    return () => clearInterval(interval);
  }, [screen, boostActiveSeconds]);

  // Handle Mute Toggle
  const handleToggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setMuted(next);
  };

  // Handle Student Logout
  const handleLogout = () => {
    saveSession(null);
    setCurrentStudent(null);
  };

  // Start Matching from Home
  const handleStartMatch = async (nickname: string, password: string) => {
    setAuthError('');
    setIsLoadingAuth(true);

    try {
      let student = currentStudent;
      if (!student) {
        student = await loginOrCreateStudent(nickname, password, selectedCharacter, selectedMap);
        setCurrentStudent(student);
      }
      setScreen('matching');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // When 4-player matching completes
  const handleMatchComplete = useCallback((matchedList: PlayerParticipant[]) => {
    finishOrderRef.current = [];
    setPlayers(matchedList);
    setTrackItems(generateTrackItems(selectedMap));
    setCurrentLane(0);
    setBoostCharges(0);
    setBoostActiveSeconds(0);
    setCanPhagocytose(false);
    setRaceElapsedSeconds(0);
    raceStartTimeRef.current = Date.now();
    setScreen('racing');
  }, [selectedMap]);

  // Move Controls
  const handleMoveLeft = useCallback(() => {
    setCurrentLane(prev => (prev > -1 ? prev - 1 : -1));
  }, []);

  const handleMoveForward = useCallback(() => {
    setCurrentLane(0);
  }, []);

  const handleMoveRight = useCallback(() => {
    setCurrentLane(prev => (prev < 1 ? prev + 1 : 1));
  }, []);

  // RBC Boost Activation
  const handleActivateBoost = useCallback(() => {
    if (boostCharges > 0 && boostActiveSeconds <= 0) {
      setBoostCharges(prev => Math.max(0, prev - 1));
      setBoostActiveSeconds(10);
      playBoostSound();
    }
  }, [boostCharges, boostActiveSeconds]);

  // WBC Phagocytosis Activation
  const handlePhagocytose = useCallback(() => {
    if (!canPhagocytose) return;

    playPhagocytosisSound();
    setCanPhagocytose(false);

    // Destroy the nearby bacteria in current or adjacent lane
    const self = playersRef.current.find(p => p.id === currentStudent?.id);
    const selfProg = self?.progress || 0;

    setTrackItems(prev =>
      prev.map(item => {
        if (item.type === 'bacteria' && !item.destroyed) {
          const diff = Math.abs(item.progress - selfProg);
          if (diff < 5) {
            return { ...item, destroyed: true };
          }
        }
        return item;
      })
    );
  }, [canPhagocytose, currentStudent]);

  // Main Race Loop (Updates player progress, AI bots, items, collisions, finish order)
  useEffect(() => {
    if (screen !== 'racing' && screen !== 'spectating') return;

    const gameLoop = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - raceStartTimeRef.current) / 1000;
      setRaceElapsedSeconds(elapsed);

      // Decrement boost timer if active
      if (boostSecRef.current > 0) {
        setBoostActiveSeconds(prev => Math.max(0, prev - 0.1));
      }

      const selfId = currentStudent?.id || '';
      let nearbyBacteriaDetected = false;

      // Update all 4 players
      setPlayers(prevPlayers => {
        const updated = prevPlayers.map(p => {
          if (p.finished) return p;

          const isSelf = p.id === selfId;
          let currentSpeed = 0.55; // base progression rate per tick

          if (isSelf) {
            // Apply RBC 10s boost
            if (boostSecRef.current > 0) {
              currentSpeed *= 1.85;
            }
          } else {
            // AI Bot logic: intelligent random fluctuations and bot boosts
            const randomJitter = (Math.random() - 0.48) * 0.12;
            currentSpeed += randomJitter;
            // Bot occasional burst
            if (Math.random() < 0.08) {
              currentSpeed *= 1.4;
            }
          }

          let newProgress = p.progress + currentSpeed;

          // Item Detection for Self
          if (isSelf) {
            trackItemsRef.current.forEach(item => {
              if (item.collected || item.destroyed) return;
              const dist = Math.abs(item.progress - newProgress);

              // Item is in proximity (within 3% progress)
              if (dist < 3) {
                if (item.type === 'bacteria') {
                  // If bacteria is in the same or nearby lane
                  nearbyBacteriaDetected = true;
                  // If player collides with bacteria without phagocytosis
                  if (item.lane === currentLaneRef.current && dist < 1.2) {
                    playBumpSound();
                    currentSpeed *= 0.4; // slowdown penalty
                  }
                } else if (item.type === 'coin') {
                  // Coin collected!
                  if (item.lane === currentLaneRef.current && dist < 1.5) {
                    playCoinSound();
                    item.collected = true;
                    // Red Blood Cell receives Boost Block charge!
                    if (selectedCharacter === 'RBC') {
                      setBoostCharges(c => c + 1);
                    }
                  }
                }
              }
            });
          }

          // Check if crossed the finish line (100% progress)
          if (newProgress >= 100) {
            newProgress = 100;
            const finishTime = elapsed;
            if (!finishOrderRef.current.includes(p.id)) {
              finishOrderRef.current.push(p.id);
            }
            const rank = finishOrderRef.current.indexOf(p.id) + 1;

            // If it's self player finishing, record stats in Firestore!
            if (isSelf) {
              updateStudentStats(
                p.id,
                rank === 1,
                selectedMap,
                finishTime,
                selectedCharacter
              ).catch(e => console.warn('Stat update error:', e));
            }

            return {
              ...p,
              progress: 100,
              finished: true,
              finishTime,
              rank,
            };
          }

          return {
            ...p,
            progress: newProgress,
            lane: isSelf ? currentLaneRef.current : (Math.floor(newProgress / 20) % 3) - 1,
            currentStageName: getCurrentStage(newProgress, selectedMap).koreanName,
          };
        });

        // Determine if all 4 players finished
        const allFinished = updated.every(p => p.finished);
        const selfFinished = updated.find(p => p.id === selfId)?.finished;

        if (allFinished) {
          // Everyone passed the finish line! Switch to Results screen!
          setTimeout(() => {
            setScreen('results');
          }, 600);
        } else if (selfFinished && screen === 'racing') {
          // Self finished first, but others are still racing -> Spectator mode!
          setScreen('spectating');
        }

        return updated;
      });

      // Update WBC phagocytosis availability flag
      if (selectedCharacter === 'WBC') {
        setCanPhagocytose(nearbyBacteriaDetected);
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [screen, currentStudent, selectedMap, selectedCharacter]);

  // Go back to Home screen
  const handleGoHome = () => {
    setScreen('home');
  };

  // Play Again with same settings
  const handlePlayAgain = () => {
    setScreen('matching');
  };

  const selfPlayer = players.find(p => p.id === currentStudent?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentStudent={currentStudent}
        isMuted={isAudioMuted}
        onToggleMute={handleToggleMute}
        onOpenScienceModal={() => setIsScienceModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Game Screen Router */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 flex flex-col justify-center">
        {screen === 'home' && (
          <HomeView
            currentStudent={currentStudent}
            selectedCharacter={selectedCharacter}
            selectedMap={selectedMap}
            onSelectCharacter={setSelectedCharacter}
            onSelectMap={setSelectedMap}
            onStartMatch={handleStartMatch}
            isLoading={isLoadingAuth}
            errorMessage={authError}
            onLogout={handleLogout}
          />
        )}

        {screen === 'matching' && (
          <MatchingView
            mapType={selectedMap}
            character={selectedCharacter}
            nickname={currentStudent?.nickname || '도전자'}
            studentId={currentStudent?.id || `stu_${Date.now()}`}
            onMatchComplete={handleMatchComplete}
            onCancel={handleGoHome}
          />
        )}

        {screen === 'racing' && (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
            {/* Live Circuit Header */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {selectedMap === 'systemic' ? '온몸순환 레이스' : '허파순환 레이스'}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs text-slate-300">
                  내 캐릭터: <b>{selectedCharacter === 'RBC' ? '적혈구' : '백혈구'}</b>
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                경과 시간: {raceElapsedSeconds.toFixed(1)}s
              </div>
            </div>

            {/* Split Grid: Canvas View (Left/Center) + Mini Anatomical Map (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
              {/* Main Racing Canvas (2 cols on large screen) */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <RaceCanvas
                  mapType={selectedMap}
                  character={selectedCharacter}
                  players={players}
                  currentPlayerId={currentStudent?.id || ''}
                  trackItems={trackItems}
                  boostActiveSeconds={boostActiveSeconds}
                />

                {/* 3 Arrow Controls + Boost / Phagocytosis Block underneath */}
                <ControlPad
                  character={selectedCharacter}
                  currentLane={currentLane}
                  onMoveLeft={handleMoveLeft}
                  onMoveForward={handleMoveForward}
                  onMoveRight={handleMoveRight}
                  boostCharges={boostCharges}
                  boostActiveSeconds={boostActiveSeconds}
                  onActivateBoost={handleActivateBoost}
                  canPhagocytose={canPhagocytose}
                  onPhagocytose={handlePhagocytose}
                />
              </div>

              {/* Side Anatomical Mini-Map & Live Leaderboard */}
              <div className="flex flex-col gap-3">
                <CirculationMap
                  mapType={selectedMap}
                  players={players}
                  currentPlayerId={currentStudent?.id || ''}
                />

                {/* Live Progress Ranking Bars */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>실시간 4인 순위</span>
                    <span className="text-[10px] text-slate-400 font-mono">100% 도착</span>
                  </div>
                  {players.map((p, idx) => (
                    <div key={p.id} className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 w-3 font-mono">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[100px]">{p.nickname}</span>
                          {p.id === currentStudent?.id && (
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1 rounded">
                              나
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {p.finished ? '완주!' : `${Math.floor(p.progress)}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-150 rounded-full ${
                            p.character === 'RBC' ? 'bg-rose-500' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'spectating' && (
          <SpectatorView
            mapType={selectedMap}
            players={players}
            currentPlayerId={currentStudent?.id || ''}
            trackItems={trackItems}
          />
        )}

        {screen === 'results' && (
          <ResultsView
            mapType={selectedMap}
            players={players}
            currentPlayerId={currentStudent?.id || ''}
            onGoHome={handleGoHome}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Science Encyclopedia Modal */}
      <ScienceModal
        isOpen={isScienceModalOpen}
        onClose={() => setIsScienceModalOpen(false)}
      />
    </div>
  );
}
