import React, { useRef, useEffect } from 'react';
import { CharacterType, MapType, PlayerParticipant, TrackItem } from '../types/game';
import { getCurrentStage } from '../utils/circulationData';

interface RaceCanvasProps {
  mapType: MapType;
  character: CharacterType;
  players: PlayerParticipant[];
  currentPlayerId: string;
  trackItems: TrackItem[];
  boostActiveSeconds: number;
}

export const RaceCanvas: React.FC<RaceCanvasProps> = ({
  mapType,
  character,
  players,
  currentPlayerId,
  trackItems,
  boostActiveSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Background blood stream particles
  const particlesRef = useRef<Array<{ x: number; y: number; speed: number; size: number; alpha: number }>>([]);

  useEffect(() => {
    // Initialize 60 bloodstream particles
    particlesRef.current = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      speed: 2 + Math.random() * 5,
      size: 2 + Math.random() * 4,
      alpha: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  const selfPlayer = players.find(p => p.id === currentPlayerId);
  const selfProgress = selfPlayer?.progress || 0;
  const currentStage = getCurrentStage(selfProgress, mapType);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      // Base vessel background based on current anatomical stage
      const stage = getCurrentStage(selfPlayer?.progress || 0, mapType);
      
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw Blood Vessel Tube
      const vesselGradient = ctx.createLinearGradient(0, 0, width, 0);
      if (stage.oxygenated) {
        vesselGradient.addColorStop(0, '#450a0a'); // Dark crimson edge
        vesselGradient.addColorStop(0.15, stage.wallColor);
        vesselGradient.addColorStop(0.5, stage.bloodColor);
        vesselGradient.addColorStop(0.85, stage.wallColor);
        vesselGradient.addColorStop(1, '#450a0a');
      } else {
        vesselGradient.addColorStop(0, '#172554'); // Dark deep blue edge
        vesselGradient.addColorStop(0.15, stage.wallColor);
        vesselGradient.addColorStop(0.5, stage.bloodColor);
        vesselGradient.addColorStop(0.85, stage.wallColor);
        vesselGradient.addColorStop(1, '#172554');
      }

      ctx.fillStyle = vesselGradient;
      ctx.fillRect(40, 0, width - 80, height);

      // Vessel Wall Pulsating borders (Simulating heartbeat pulse)
      const pulse = Math.sin(time * 3) * 3;
      ctx.strokeStyle = stage.oxygenated ? '#fda4af' : '#93c5fd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left vessel wall
      ctx.moveTo(40 + pulse, 0);
      ctx.lineTo(40 + pulse, height);
      // Right vessel wall
      ctx.moveTo(width - 40 - pulse, 0);
      ctx.lineTo(width - 40 - pulse, height);
      ctx.stroke();

      // Capillary network cross-hatching effect if in capillaries
      if (stage.vesselType === 'capillary') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 30) {
          ctx.beginPath();
          ctx.moveTo(50, i + Math.sin(time + i) * 6);
          ctx.lineTo(width - 50, i - Math.cos(time + i) * 6);
          ctx.stroke();
        }
      }

      // Valve flaps if in Vein (Vena Cava or Pulmonary Vein)
      if (stage.vesselType === 'vein') {
        const valveY = ((time * 30) % height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Left flap
        ctx.moveTo(45, valveY);
        ctx.lineTo(width * 0.45, valveY + 20);
        // Right flap
        ctx.moveTo(width - 45, valveY);
        ctx.lineTo(width * 0.55, valveY + 20);
        ctx.stroke();
      }

      // Draw 3 Lane Dashed Dividers
      const leftLaneX = width * 0.28;
      const centerLaneX = width * 0.5;
      const rightLaneX = width * 0.72;

      ctx.setLineDash([12, 16]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.lineDashOffset = -time * 30; // Downward flow animation
      // Lane dividers
      ctx.beginPath();
      ctx.moveTo(width * 0.39, 0);
      ctx.lineTo(width * 0.39, height);
      ctx.moveTo(width * 0.61, 0);
      ctx.lineTo(width * 0.61, height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Bloodstream Flowing Particles
      const speedMultiplier = boostActiveSeconds > 0 ? 3 : 1;
      particlesRef.current.forEach(p => {
        p.y += p.speed * speedMultiplier;
        if (p.y > height) {
          p.y = 0;
          p.x = 60 + Math.random() * (width - 120);
        }
        ctx.fillStyle = stage.oxygenated
          ? `rgba(255, 200, 200, ${p.alpha})`
          : `rgba(200, 220, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Helper to calculate X coord for lane (-1, 0, 1)
      const getLaneX = (lane: number) => {
        if (lane === -1) return leftLaneX;
        if (lane === 1) return rightLaneX;
        return centerLaneX;
      };

      // Draw Track Items (Coins & Bacteria)
      // Items are positioned relative to player progress (visible range: -10% to +15%)
      const playerProg = selfPlayer?.progress || 0;
      trackItems.forEach(item => {
        if (item.collected || item.destroyed) return;
        const diff = item.progress - playerProg;
        if (diff > -2 && diff < 16) {
          // Map diff to screen Y (ahead of player is higher up: y < 360)
          const itemY = 360 - (diff * 22);
          const itemX = getLaneX(item.lane);

          if (item.type === 'coin') {
            // Boost Coin: Oxygen Molecule Disc (O₂)
            ctx.save();
            ctx.translate(itemX, itemY);
            ctx.rotate(time * 2);

            // Outer glow
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;

            // Coin circle
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            // Inner ring
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            // O2 label
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('O₂ 코인', 0, 0);
            ctx.restore();
          } else {
            // Bacteria / Pathogen Obstacle
            ctx.save();
            ctx.translate(itemX, itemY);

            // Spiky microbe body
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#15803d';

            ctx.beginPath();
            const spikes = 8;
            for (let s = 0; s < spikes; s++) {
              const angle = (s / spikes) * Math.PI * 2 + time;
              const r = s % 2 === 0 ? 15 : 10;
              const sx = Math.cos(angle) * r;
              const sy = Math.sin(angle) * r;
              if (s === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();

            // Bacteria eyes
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-4, -2, 1, 0, Math.PI * 2);
            ctx.arc(4, -2, 1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#dcfce7';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('세균', 0, 14);
            ctx.restore();
          }
        }
      });

      // Draw Other Rival Players
      players.forEach(p => {
        if (p.id === currentPlayerId) return;

        // Position relative to current player
        const diff = p.progress - playerProg;
        // Rival Y: baseline is 360 - (diff * 22)
        const rivalY = 360 - (diff * 22);

        if (rivalY > -50 && rivalY < height + 50) {
          const rivalX = getLaneX(p.lane);
          ctx.save();
          ctx.translate(rivalX, rivalY);

          // Draw rival sprite
          if (p.character === 'RBC') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
          }

          // Rival Nickname tag
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(-35, -28, 70, 14);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(-35, -28, 70, 14);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.nickname.slice(0, 7), 0, -17);
          ctx.restore();
        }
      });

      // Draw Main Player (Self)
      if (selfPlayer) {
        const selfX = getLaneX(selfPlayer.lane);
        const selfY = 360; // Fixed player Y coordinate

        ctx.save();
        ctx.translate(selfX, selfY);

        // Boost aura trail
        if (boostActiveSeconds > 0) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 25;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.moveTo(-20, 20);
          ctx.lineTo(0, 50 + Math.random() * 15);
          ctx.lineTo(20, 20);
          ctx.closePath();
          ctx.fill();
        }

        // Draw Player Cell Body
        if (selfPlayer.character === 'RBC') {
          // Red Blood Cell: Donut/biconcave disc
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = boostActiveSeconds > 0 ? 20 : 8;

          // Outer ring
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.ellipse(0, 0, 24, 18, Math.sin(time) * 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Inner depression
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.ellipse(0, 0, 12, 8, Math.sin(time) * 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Oxygen molecule / Hemoglobin shine
          ctx.fillStyle = '#fecaca';
          ctx.beginPath();
          ctx.arc(-8, -4, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // White Blood Cell: Amoeboid leukocyte with pseudopods
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;

          // Pseudopod shape
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2;
            const r = 20 + Math.sin(time * 2 + a) * 4;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Multilobed nucleus
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(-5, -4, 5, 0, Math.PI * 2);
          ctx.arc(4, -3, 6, 0, Math.PI * 2);
          ctx.arc(0, 5, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Self Player Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(`★ ${selfPlayer.nickname}`, 0, -26);

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mapType, character, players, currentPlayerId, trackItems, boostActiveSeconds, selfPlayer]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 flex flex-col items-center">
      {/* Top Stage Information HUD Banner */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: currentStage.bloodColor }}
          />
          <span className="font-bold text-white text-xs sm:text-sm">
            {currentStage.koreanName}
          </span>
          <span className="text-[11px] text-slate-300 hidden md:inline">
            ({currentStage.description.slice(0, 36)}...)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300">
            진행률: {Math.floor(selfProgress)}%
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={560}
        height={440}
        className="w-full max-w-[560px] h-[340px] sm:h-[420px] object-cover"
      />
    </div>
  );
};
