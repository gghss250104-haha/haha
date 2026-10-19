import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerParticipant, MapType } from '../types/game';
import { Trophy, Home, Medal, Award, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { playVictorySound } from '../utils/audio';

interface ResultsViewProps {
  mapType: MapType;
  players: PlayerParticipant[];
  currentPlayerId: string;
  onGoHome: () => void;
  onPlayAgain: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  mapType,
  players,
  currentPlayerId,
  onGoHome,
  onPlayAgain,
}) => {
  // Sort players by rank (or finishTime)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return (a.finishTime || 999) - (b.finishTime || 999);
  });

  const selfPlayer = sortedPlayers.find(p => p.id === currentPlayerId);
  const isWinner = selfPlayer?.rank === 1;

  useEffect(() => {
    // Play celebratory victory fanfare
    playVictorySound();

    // Trigger colorful confetti explosion!
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      if (isWinner) {
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      }
    } catch {}
  }, [isWinner]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Banner */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-2xl shadow-amber-500/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          {isWinner ? '🎉 영광의 1위! 레이스 제패!' : '🏁 모든 선수가 완주했습니다!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          {mapType === 'systemic'
            ? '온몸순환 (좌심실 ➔ 대동맥 ➔ 온몸 모세혈관 ➔ 대정맥 ➔ 우심방)'
            : '허파순환 (우심실 ➔ 허파동맥 ➔ 폐모세혈관 ➔ 허파정맥 ➔ 좌심방)'}
        </p>
      </div>

      {/* Podium Cards (1st, 2nd, 3rd, 4th) */}
      <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-2 text-xs font-semibold text-slate-400">
          <span>순위 & 선수</span>
          <span>캐릭터</span>
          <span>완주 시간</span>
        </div>

        {sortedPlayers.map((player, index) => {
          const rank = player.rank || index + 1;
          const isSelf = player.id === currentPlayerId;

          let rankBadge = (
            <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
              {rank}
            </span>
          );

          if (rank === 1) {
            rankBadge = (
              <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/40 text-xs">
                🥇 1
              </span>
            );
          } else if (rank === 2) {
            rankBadge = (
              <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 font-black flex items-center justify-center shadow text-xs">
                🥈 2
              </span>
            );
          } else if (rank === 3) {
            rankBadge = (
              <span className="w-7 h-7 rounded-xl bg-amber-700 text-amber-100 font-black flex items-center justify-center shadow text-xs">
                🥉 3
              </span>
            );
          }

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isSelf
                  ? 'bg-gradient-to-r from-amber-500/20 via-slate-800/80 to-slate-800 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                  : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              {/* Rank & Nickname */}
              <div className="flex items-center gap-3">
                {rankBadge}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">
                      {player.nickname}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                        나
                      </span>
                    )}
                    {player.isBot && (
                      <span className="text-[10px] bg-slate-700 text-slate-300 font-medium px-1.5 py-0.2 rounded">
                        AI
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {player.character === 'RBC' ? '산소 운반 적혈구' : '면역 수호 백혈구'}
                  </span>
                </div>
              </div>

              {/* Character Badge */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.character === 'RBC' ? '#ef4444' : '#06b6d4' }}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {player.character === 'RBC' ? '적혈구' : '백혈구'}
                </span>
              </div>

              {/* Finish Time */}
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                {player.finishTime?.toFixed(2)}초
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons: Home Button & Play Again Button */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* User requested: "결과가 모두 나오면 순위 밑에 홈버튼이 있는데 그걸 누르면 홈으로 돌아간다." */}
        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-black text-base flex items-center justify-center gap-2 border border-slate-600 shadow-xl cursor-pointer active:scale-95 transition-all"
        >
          <Home className="w-5 h-5 text-amber-400" />
          <span>홈으로 돌아가기 (Home)</span>
        </button>

        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full sm:w-1/2 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>다시 레이스하기</span>
        </button>
      </div>
    </div>
  );
};
