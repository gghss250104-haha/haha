import React from 'react';
import { StudentProfile } from '../types/game';
import { Volume2, VolumeX, BookOpen, User, LogOut, Award, Heart } from 'lucide-react';

interface NavbarProps {
  currentStudent: StudentProfile | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenScienceModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  isMuted,
  onToggleMute,
  onOpenScienceModal,
  onLogout,
}) => {
  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none flex items-center gap-1.5">
              순환계 레이서
              <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded-full hidden sm:inline">
                과학 레이싱
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              동물의 온몸순환 & 허파순환 탐험
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Science Encyclopedia Button */}
          <button
            type="button"
            onClick={onOpenScienceModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="순환계 과학 원리 도감 열기"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">순환계 도감</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isMuted ? '음소거 해제' : '음소거'}
            aria-label="소리 설정"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Student Status Pill */}
          {currentStudent ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                  <User className="w-3 h-3 text-amber-400" />
                  {currentStudent.nickname}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end font-mono">
                  <Award className="w-3 h-3 text-amber-500" />
                  {currentStudent.wins}승 / {currentStudent.totalRaces}전
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-colors cursor-pointer"
                title="로그아웃 / 다른 학생으로 변경"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-semibold">
              로그인 필요
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
