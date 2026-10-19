import React, { useState, useEffect } from 'react';
import { CharacterType, MapType, PlayerParticipant } from '../types/game';
import { Users, Bot, Check, Clock, X, Zap } from 'lucide-react';
import { playCountdownBeep } from '../utils/audio';

interface MatchingViewProps {
  mapType: MapType;
  character: CharacterType;
  nickname: string;
  studentId: string;
  onMatchComplete: (players: PlayerParticipant[]) => void;
  onCancel: () => void;
}

const AI_BOT_NAMES = [
  { name: 'AI_산소특급_적혈구', char: 'RBC' as CharacterType },
  { name: 'AI_면역수호_백혈구', char: 'WBC' as CharacterType },
  { name: 'AI_혈소판로봇', char: 'RBC' as CharacterType },
  { name: 'AI_헤모글로빈봇', char: 'RBC' as CharacterType },
  { name: 'AI_대식세포봇', char: 'WBC' as CharacterType },
];

export const MatchingView: React.FC<MatchingViewProps> = ({
  mapType,
  character,
  nickname,
  studentId,
  onMatchComplete,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [countdownToStart, setCountdownToStart] = useState<number | null>(null);

  // Initialize matching slots with self in Slot 1
  const [matchedPlayers, setMatchedPlayers] = useState<PlayerParticipant[]>([
    {
      id: studentId,
      nickname,
      character,
      isBot: false,
      avatarColor: character === 'RBC' ? '#ef4444' : '#06b6d4',
      progress: 0,
      lane: 0,
      speed: 1,
      finished: false,
      currentStageName: mapType === 'systemic' ? '좌심실' : '우심실',
      oxygenSaturation: mapType === 'systemic' ? 98 : 40,
    },
  ]);

  // 10-second timer logic
  useEffect(() => {
    if (countdownToStart !== null) return;

    if (secondsLeft <= 0) {
      // 10 seconds expired: Fill remaining slots with AI robots!
      fillRemainingSlotsWithBots();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          fillRemainingSlotsWithBots();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, countdownToStart]);

  // Fill up to 4 players with AI robots
  const fillRemainingSlotsWithBots = () => {
    setMatchedPlayers(prev => {
      if (prev.length >= 4) return prev;
      const currentList = [...prev];
      let botIndex = 0;

      while (currentList.length < 4) {
        const botTemplate = AI_BOT_NAMES[botIndex % AI_BOT_NAMES.length];
        botIndex++;
        currentList.push({
          id: `bot_${Date.now()}_${botIndex}`,
          nickname: botTemplate.name,
          character: botTemplate.char,
          isBot: true,
          avatarColor: botTemplate.char === 'RBC' ? '#ef4444' : '#06b6d4',
          progress: 0,
          lane: (currentList.length % 3) - 1,
          speed: 1,
          finished: false,
          currentStageName: mapType === 'systemic' ? '좌심실' : '우심실',
          oxygenSaturation: mapType === 'systemic' ? 98 : 40,
        });
      }
      return currentList;
    });

    // Start 3-second match start countdown
    setCountdownToStart(3);
  };

  // 3-second countdown to race
  useEffect(() => {
    if (countdownToStart === null) return;

    if (countdownToStart > 0) {
      playCountdownBeep(false);
      const timer = setTimeout(() => {
        setCountdownToStart(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownToStart === 0) {
      playCountdownBeep(true);
      const timer = setTimeout(() => {
        onMatchComplete(matchedPlayers);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [countdownToStart, matchedPlayers, onMatchComplete]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 py-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>4인 실시간 순환계 레이스 매칭</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {countdownToStart !== null ? (
            <span className="text-amber-400 animate-pulse">
              레이스 시작 {countdownToStart === 0 ? '출발!' : `${countdownToStart}초 전!`}
            </span>
          ) : (
            <span>같은 맵 참가자를 찾는 중입니다...</span>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          선택한 맵:{' '}
          <span className="text-white font-bold">
            {mapType === 'systemic' ? '온몸순환 (좌심실 출발)' : '허파순환 (우심실 출발)'}
          </span>
        </p>
      </div>

      {/* 10s Timer Banner */}
      {countdownToStart === null && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-lg border border-amber-500/40">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs text-slate-400">남은 모집 시간</div>
              <div className="text-sm font-bold text-white">
                <span className="text-amber-400 font-mono text-base">{secondsLeft}</span>초 후 AI 로봇이 빈자리를 자동 대체합니다
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fillRemainingSlotsWithBots}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold border border-amber-400/40 hover:border-amber-400 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>즉시 시작</span>
          </button>
        </div>
      )}

      {/* 4 Player Slots Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => {
          const player = matchedPlayers[index];
          const isSlotFilled = !!player;

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                isSlotFilled
                  ? player.id === studentId
                    ? 'bg-slate-850 border-amber-400/60 ring-2 ring-amber-400/20 shadow-lg'
                    : 'bg-slate-900/90 border-slate-700'
                  : 'bg-slate-950/60 border-dashed border-slate-800 text-slate-600'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold border ${
                  isSlotFilled
                    ? player.character === 'RBC'
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                {isSlotFilled ? (
                  player.isBot ? (
                    <Bot className="w-6 h-6 text-slate-300" />
                  ) : (
                    <span className="text-xl">
                      {player.character === 'RBC' ? '🔴' : '🛡️'}
                    </span>
                  )
                ) : (
                  <span>?</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    슬롯 {index + 1}
                  </span>
                  {isSlotFilled && (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3" /> 준비 완료
                    </span>
                  )}
                </div>

                <div className="truncate text-sm font-bold text-white mt-0.5">
                  {isSlotFilled ? (
                    <span className="flex items-center gap-1">
                      {player.nickname}
                      {player.id === studentId && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1 rounded">
                          나
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs animate-pulse">
                      선수 대기 중...
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isSlotFilled
                    ? player.character === 'RBC'
                      ? '적혈구 (부스트)'
                      : '백혈구 (식균작용)'
                    : '10초 후 AI 로봇 대체'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      {countdownToStart === null && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" /> 매칭 취소하고 홈으로 돌아가기
        </button>
      )}
    </div>
  );
};
