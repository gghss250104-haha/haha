import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUp, ArrowRight, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { CharacterType } from '../types/game';

interface ControlPadProps {
  character: CharacterType;
  currentLane: number; // -1 = left, 0 = center, 1 = right
  onMoveLeft: () => void;
  onMoveForward: () => void;
  onMoveRight: () => void;
  // Boost state for RBC
  boostCharges: number;
  boostActiveSeconds: number; // >0 if currently active
  onActivateBoost: () => void;
  // Phagocytosis state for WBC
  canPhagocytose: boolean;
  onPhagocytose: () => void;
  disabled?: boolean;
}

export const ControlPad: React.FC<ControlPadProps> = ({
  character,
  currentLane,
  onMoveLeft,
  onMoveForward,
  onMoveRight,
  boostCharges,
  boostActiveSeconds,
  onActivateBoost,
  canPhagocytose,
  onPhagocytose,
  disabled = false,
}) => {
  // Global keyboard shortcuts (Left/Right/Up, A/W/D, Space/B/E)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code) || ['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        onMoveLeft();
      } else if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code) || ['ArrowUp', 'KeyW', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        onMoveForward();
      } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code) || ['ArrowRight', 'KeyD', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        onMoveRight();
      } else if (['Space', 'KeyB', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        if (character === 'RBC' && boostCharges > 0 && boostActiveSeconds <= 0) {
          onActivateBoost();
        } else if (character === 'WBC' && canPhagocytose) {
          onPhagocytose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, character, boostCharges, boostActiveSeconds, canPhagocytose, onMoveLeft, onMoveForward, onMoveRight, onActivateBoost, onPhagocytose]);

  const isRBC = character === 'RBC';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-2 select-none">
      {/* Direction Buttons Row: Left, Forward, Right */}
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Left Arrow */}
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveLeft}
          className={`flex-1 py-4 px-3 rounded-2xl flex flex-col items-center justify-center font-bold text-white transition-all transform active:scale-95 shadow-lg border ${
            currentLane === -1
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 ring-4 ring-amber-400/40 shadow-amber-500/30'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
          }`}
          aria-label="왼쪽으로 이동"
        >
          <ArrowLeft className="w-7 h-7 mb-0.5" />
          <span className="text-xs">왼쪽 (A / ◀)</span>
        </button>

        {/* Forward Arrow */}
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveForward}
          className={`flex-1 py-4 px-3 rounded-2xl flex flex-col items-center justify-center font-bold text-white transition-all transform active:scale-95 shadow-lg border ${
            currentLane === 0
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-300 ring-4 ring-emerald-400/40 shadow-emerald-500/30'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
          }`}
          aria-label="앞쪽으로 직진"
        >
          <ArrowUp className="w-7 h-7 mb-0.5" />
          <span className="text-xs">앞쪽 (W / ▲)</span>
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveRight}
          className={`flex-1 py-4 px-3 rounded-2xl flex flex-col items-center justify-center font-bold text-white transition-all transform active:scale-95 shadow-lg border ${
            currentLane === 1
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 ring-4 ring-amber-400/40 shadow-amber-500/30'
              : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
          }`}
          aria-label="오른쪽으로 이동"
        >
          <ArrowRight className="w-7 h-7 mb-0.5" />
          <span className="text-xs">오른쪽 (D / ▶)</span>
        </button>
      </div>

      {/* Special Block Row underneath arrows as requested */}
      <div className="w-full">
        {isRBC ? (
          /* Red Blood Cell (RBC) Boost Block */
          <div className="w-full">
            {boostActiveSeconds > 0 ? (
              /* Boost Currently Active (10s countdown) */
              <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-extrabold flex items-center justify-between shadow-xl shadow-orange-500/40 animate-pulse border-2 border-yellow-300">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 animate-bounce text-yellow-200 fill-yellow-200" />
                  <span className="text-sm sm:text-base tracking-wide">
                    🔥 10초 폭풍 부스트 가속 활성화 중!
                  </span>
                </div>
                <div className="bg-black/30 px-3 py-1 rounded-full text-base font-mono">
                  {boostActiveSeconds.toFixed(1)}s
                </div>
              </div>
            ) : boostCharges > 0 ? (
              /* Boost Coin Collected: Boost Block Available! */
              <button
                type="button"
                disabled={disabled}
                onClick={onActivateBoost}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-red-600/40 transform active:scale-98 transition-all border-2 border-yellow-300 cursor-pointer animate-bounce"
              >
                <Zap className="w-6 h-6 text-yellow-200 fill-yellow-200" />
                <span>부스트 블럭 누르기! (10초간 슈퍼 가속!) [Space / B]</span>
                <span className="bg-yellow-400 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  {boostCharges}개 보유
                </span>
              </button>
            ) : (
              /* Boost Not Yet Collected */
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400/80" />
                <span>혈관 속 <b>부스트 코인(산소 에너지)</b>을 획득하면 여기에 부스트 블럭이 나타납니다!</span>
              </div>
            )}
          </div>
        ) : (
          /* White Blood Cell (WBC) Phagocytosis Block */
          <div className="w-full">
            {canPhagocytose ? (
              /* Bacteria detected nearby! Phagocytosis block appears! */
              <button
                type="button"
                disabled={disabled}
                onClick={onPhagocytose}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/40 transform active:scale-98 transition-all border-2 border-cyan-200 cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-6 h-6 text-yellow-300 animate-spin origin-center" />
                <span>🚨 세균 발견! [식균 버튼] 눌러 세균 물리치기! [Space / E]</span>
              </button>
            ) : (
              /* Pathogen detector idle */
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400/80" />
                <span>혈관 속 <b>장애물(세균)</b> 출현 시 여기에 <b>식균 버튼</b>이 나타납니다!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
