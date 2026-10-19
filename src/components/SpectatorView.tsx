import React, { useState } from 'react';
import { PlayerParticipant, MapType, TrackItem } from '../types/game';
import { RaceCanvas } from './RaceCanvas';
import { CirculationMap } from './CirculationMap';
import { Eye, Trophy, CheckCircle2, Clock } from 'lucide-react';
import { getCurrentStage } from '../utils/circulationData';

interface SpectatorViewProps {
  mapType: MapType;
  players: PlayerParticipant[];
  currentPlayerId: string;
  trackItems: TrackItem[];
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({
  mapType,
  players,
  currentPlayerId,
  trackItems,
}) => {
  const selfPlayer = players.find(p => p.id === currentPlayerId);
  // Find currently running players
  const runningPlayers = players.filter(p => !p.finished);

  // Active spectator target
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    runningPlayers[0]?.id || currentPlayerId
  );

  const activeTarget = players.find(p => p.id === selectedTargetId) || players[0];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-slate-900/90 border border-emerald-500/50 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                완주 완료!
              </span>
              <span className="text-white font-bold text-sm sm:text-base">
                {selfPlayer?.nickname}님 골인! ({selfPlayer?.rank}위)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              아직 달리고 있는 선수들의 혈관 레이스를 구경하고 있습니다...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 font-mono">
          <Clock className="w-4 h-4 text-emerald-400" />
          내 기록: {selfPlayer?.finishTime?.toFixed(2)}초
        </div>
      </div>

      {/* Spectator Target Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-semibold shrink-0 flex items-center gap-1">
          <Eye className="w-4 h-4 text-cyan-400" /> 관전 대상:
        </span>
        {players.map(p => {
          const isSelected = p.id === selectedTargetId;
          const stage = getCurrentStage(p.progress, mapType);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedTargetId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.character === 'RBC' ? '#ef4444' : '#06b6d4' }}
              />
              <span>{p.nickname}</span>
              {p.finished ? (
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded">
                  {p.rank}위 완주
                </span>
              ) : (
                <span className="text-[10px] text-amber-300">
                  {Math.floor(p.progress)}% ({stage.koreanName.split(' ')[0]})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live View & Mini Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Spectator Camera Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <RaceCanvas
            mapType={mapType}
            character={activeTarget.character}
            players={players}
            currentPlayerId={activeTarget.id}
            trackItems={trackItems}
            boostActiveSeconds={0}
          />
        </div>

        {/* Real-time Mini Map & Player Progress */}
        <div className="flex flex-col gap-3">
          <CirculationMap
            mapType={mapType}
            players={players}
            currentPlayerId={selectedTargetId}
          />

          {/* Live Progress Bar for All 4 racers */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-3 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> 실시간 레이스 순위 현황
            </h4>
            {players.map((p, index) => {
              const isFinished = p.finished;
              return (
                <div key={p.id} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono w-4 text-slate-400">
                        {p.rank ? `${p.rank}위` : `${index + 1}위`}
                      </span>
                      {p.nickname}
                      {p.id === currentPlayerId && (
                        <span className="text-[10px] text-amber-400 font-bold">(나)</span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {isFinished ? `${p.finishTime?.toFixed(2)}s (완주)` : `${Math.floor(p.progress)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        p.character === 'RBC' ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
