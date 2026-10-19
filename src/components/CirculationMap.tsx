import React from 'react';
import { MapType, PlayerParticipant } from '../types/game';

interface CirculationMapProps {
  mapType: MapType;
  players: PlayerParticipant[];
  currentPlayerId: string;
}

export const CirculationMap: React.FC<CirculationMapProps> = ({
  mapType,
  players,
  currentPlayerId,
}) => {
  // Map progress (0-100) to anatomical coordinates on an SVG circulatory circuit
  // Circuit has two loops: Top loop is Pulmonary (Lungs), Bottom loop is Systemic (Body)
  // Center is the Heart (with 4 chambers: RA, RV on left of viewer, LA, LV on right)
  // (In anatomy: Right side of heart is on the viewer's left, Left side is on viewer's right)

  const getCoordinatesForProgress = (progress: number, type: MapType) => {
    const p = Math.max(0, Math.min(100, progress)) / 100;

    if (type === 'systemic') {
      // 좌심실 (LV: x=145, y=140) -> 대동맥 (Aorta arc to x=185, y=170) -> 온몸 모세혈관 (Body: x=120, y=225) -> 대정맥 (Vena Cava: x=55, y=170) -> 우심방 (RA: x=95, y=110)
      if (p <= 0.2) {
        // LV out through aorta root
        const t = p / 0.2;
        return { x: 145 + t * 30, y: 140 - t * 10 };
      } else if (p <= 0.45) {
        // Aorta sweeping down to systemic organs
        const t = (p - 0.2) / 0.25;
        return { x: 175 - t * 20, y: 130 + t * 65 };
      } else if (p <= 0.75) {
        // Systemic capillary beds (across body tissues)
        const t = (p - 0.45) / 0.3;
        return { x: 155 - t * 70, y: 195 + Math.sin(t * Math.PI) * 15 };
      } else if (p <= 0.95) {
        // Vena Cava heading back to Right Atrium
        const t = (p - 0.75) / 0.2;
        return { x: 85 - t * 20, y: 195 - t * 75 };
      } else {
        // Into Right Atrium
        const t = (p - 0.95) / 0.05;
        return { x: 65 + t * 25, y: 120 - t * 15 };
      }
    } else {
      // Pulmonary: 우심실 (RV: x=95, y=140) -> 허파동맥 (PA up to x=55, y=55) -> 폐 모세혈관 (Lungs: x=120, y=30) -> 허파정맥 (PV: x=185, y=60) -> 좌심방 (LA: x=145, y=110)
      if (p <= 0.2) {
        // RV out to pulmonary trunk
        const t = p / 0.2;
        return { x: 95 - t * 30, y: 140 - t * 25 };
      } else if (p <= 0.45) {
        // Pulmonary artery to lung capillaries
        const t = (p - 0.2) / 0.25;
        return { x: 65 + t * 35, y: 115 - t * 65 };
      } else if (p <= 0.75) {
        // Lung capillary gas exchange (alveoli)
        const t = (p - 0.45) / 0.3;
        return { x: 100 + t * 50, y: 50 + Math.sin(t * Math.PI) * 10 };
      } else if (p <= 0.95) {
        // Pulmonary vein returning to heart
        const t = (p - 0.75) / 0.2;
        return { x: 150 + t * 25, y: 60 + t * 40 };
      } else {
        // Into Left Atrium
        const t = (p - 0.95) / 0.05;
        return { x: 175 - t * 30, y: 100 + t * 10 };
      }
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 shadow-xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-1 text-xs font-semibold px-1 text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          {mapType === 'systemic' ? '온몸순환 실시간 경로 (체순환)' : '허파순환 실시간 경로 (폐순환)'}
        </span>
        <span className="text-[10px] text-slate-400">
          {mapType === 'systemic' ? '좌심실 ➔ 대동맥 ➔ 모세혈관 ➔ 대정맥 ➔ 우심방' : '우심실 ➔ 허파동맥 ➔ 폐모세혈관 ➔ 허파정맥 ➔ 좌심방'}
        </span>
      </div>

      <div className="relative w-full max-w-[260px] h-[210px] flex items-center justify-center">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="oxygenatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            <linearGradient id="deoxygenatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lungs (Pulmonary circuit top area) */}
          <g opacity={mapType === 'pulmonary' ? 1 : 0.35}>
            <ellipse cx="65" cy="50" rx="35" ry="24" fill="#ec4899" fillOpacity="0.18" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" />
            <ellipse cx="175" cy="50" rx="35" ry="24" fill="#ec4899" fillOpacity="0.18" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="120" y="45" fill="#fbcfe8" fontSize="10" fontWeight="bold" textAnchor="middle">폐 (허파 모세혈관)</text>
            <text x="120" y="58" fill="#f472b6" fontSize="8" textAnchor="middle">기체 교환 (O₂ 흡수, CO₂ 배출)</text>
          </g>

          {/* Body Systemic Tissues (Bottom area) */}
          <g opacity={mapType === 'systemic' ? 1 : 0.35}>
            <rect x="35" y="185" width="170" height="42" rx="12" fill="#8b5cf6" fillOpacity="0.18" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="120" y="202" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle">온몸의 모세혈관 망</text>
            <text x="120" y="215" fill="#c084fc" fontSize="8" textAnchor="middle">세포 물질교환 (산소 공급, 노폐물 수거)</text>
          </g>

          {/* Anatomical Heart Center Box */}
          <rect x="75" y="90" width="90" height="75" rx="14" fill="#1e1e2d" stroke="#e11d48" strokeWidth="2" />
          <line x1="120" y1="90" x2="120" y2="165" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="75" y1="125" x2="165" y2="125" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Heart Chambers labels */}
          {/* Note: In anatomical diagrams, patient's Right is on viewer's Left */}
          <text x="96" y="112" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">우심방</text>
          <text x="96" y="148" fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle">우심실</text>
          <text x="144" y="112" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">좌심방</text>
          <text x="144" y="148" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">좌심실</text>

          {/* Systemic Circuit Loop Paths */}
          {mapType === 'systemic' ? (
            <g>
              {/* Left Ventricle -> Aorta (Red) */}
              <path
                d="M 145 145 C 200 130, 200 180, 155 200"
                fill="none"
                stroke="url(#oxygenatedGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              {/* Capillaries -> Vena Cava -> Right Atrium (Blue) */}
              <path
                d="M 155 200 C 80 220, 45 170, 95 110"
                fill="none"
                stroke="url(#deoxygenatedGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              {/* Start & Goal Badges */}
              <circle cx="145" cy="145" r="4" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
              <text x="156" y="158" fill="#4ade80" fontSize="8" fontWeight="bold">출발</text>
              <circle cx="95" cy="110" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
              <text x="75" y="103" fill="#fbbf24" fontSize="8" fontWeight="bold">골인</text>
            </g>
          ) : (
            <g>
              {/* Right Ventricle -> Pulmonary Artery (Blue) */}
              <path
                d="M 95 145 C 40 130, 40 65, 100 50"
                fill="none"
                stroke="url(#deoxygenatedGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              {/* Pulmonary Capillaries -> Pulmonary Vein -> Left Atrium (Red) */}
              <path
                d="M 100 50 C 150 40, 200 65, 145 110"
                fill="none"
                stroke="url(#oxygenatedGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              {/* Start & Goal Badges */}
              <circle cx="95" cy="145" r="4" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
              <text x="68" y="158" fill="#4ade80" fontSize="8" fontWeight="bold">출발</text>
              <circle cx="145" cy="110" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
              <text x="154" y="103" fill="#fbbf24" fontSize="8" fontWeight="bold">골인</text>
            </g>
          )}

          {/* Render Player Markers */}
          {players.map((p) => {
            const coord = getCoordinatesForProgress(p.progress, mapType);
            const isSelf = p.id === currentPlayerId;
            const markerColor = p.character === 'RBC' ? '#ef4444' : '#06b6d4';

            return (
              <g key={p.id} className="transition-all duration-300 ease-out">
                {/* Glow ring for self */}
                {isSelf && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="9"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                    className="animate-spin origin-center"
                  />
                )}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelf ? 6.5 : 5}
                  fill={markerColor}
                  stroke={isSelf ? '#fbbf24' : '#ffffff'}
                  strokeWidth={isSelf ? 2 : 1}
                />
                {/* Player label */}
                <text
                  x={coord.x}
                  y={coord.y - 8}
                  fill={isSelf ? '#fde047' : '#e2e8f0'}
                  fontSize={isSelf ? '8' : '7'}
                  fontWeight={isSelf ? 'bold' : 'normal'}
                  textAnchor="middle"
                  className="select-none pointer-events-none drop-shadow"
                >
                  {isSelf ? `★${p.nickname}` : p.nickname.slice(0, 5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-3 mt-1 text-[11px] text-slate-300">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> 동맥혈 (산소 풍부)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 정맥혈 (산소 부족)
        </span>
      </div>
    </div>
  );
};
