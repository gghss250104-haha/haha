import React from 'react';
import { X, BookOpen, Heart, Activity, ShieldCheck, Zap } from 'lucide-react';

interface ScienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScienceModal: React.FC<ScienceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">동물의 순환계 과학 도감</h3>
              <p className="text-xs text-slate-400">심장 구조, 온몸순환, 허파순환, 혈구의 기능</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-5 text-sm text-slate-300">
          {/* Section 1: Systemic Circulation */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2">
            <h4 className="font-bold text-rose-400 flex items-center gap-2 text-base">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              1. 온몸순환 (체순환, Systemic Circulation)
            </h4>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-rose-500/30 text-xs font-mono text-rose-200">
              좌심실 ➔ 대동맥 ➔ 온몸의 모세혈관 ➔ 대정맥 ➔ 우심방
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
              <li>
                <b>좌심실 (출발):</b> 온몸으로 피를 보내야 하므로 심장 방 중 가장 두꺼운 근육벽을 가지고 있습니다.
              </li>
              <li>
                <b>대동맥:</b> 가장 굵은 혈관으로, 높은 혈압을 견디기 위해 혈관벽이 두껍고 탄력성이 뛰어납니다.
              </li>
              <li>
                <b>온몸의 모세혈관:</b> 한 겹의 세포층으로 되어 있어 조직 세포에 산소($O_2$)와 영양소를 주고, 이산화탄소($CO_2$)와 노폐물을 받아옵니다.
              </li>
              <li>
                <b>대정맥 & 우심방 (도착):</b> 산소를 소모한 암적색 정맥혈이 심장(우심방)으로 되돌아옵니다. 정맥은 혈압이 낮아 <b>판막(Valve)</b>이 역류를 방지합니다.
              </li>
            </ul>
          </div>

          {/* Section 2: Pulmonary Circulation */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-cyan-400" />
              2. 허파순환 (폐순환, Pulmonary Circulation)
            </h4>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-200">
              우심실 ➔ 허파동맥(폐동맥) ➔ 허파의 모세혈관 ➔ 허파정맥(폐정맥) ➔ 좌심방
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
              <li>
                <b>우심실 (출발):</b> 온몸을 돌고 온 산소가 적은 혈액을 폐로 뿜어냅니다.
              </li>
              <li>
                <b>허파동맥:</b> 이름은 동맥이지만 산소가 적은 <b>정맥혈(암적색)</b>이 흐르는 유일한 동맥입니다.
              </li>
              <li>
                <b>허파의 모세혈관:</b> 허파꽈리(폐포)와 만나 <b>기체 교환</b>을 하여 이산화탄소를 내보내고 산소를 가득 채웁니다.
              </li>
              <li>
                <b>허파정맥 & 좌심방 (도착):</b> 산소가 풍부한 <b>선홍색 동맥혈</b>이 되어 심장의 좌심방으로 돌아옵니다.
              </li>
            </ul>
          </div>

          {/* Section 3: Characters & Biological functions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* RBC */}
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-400" /> 적혈구 (RBC)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                가운데가 오목한 원반 모양이며 핵이 없습니다. <b>헤모글로빈</b> 단백질로 산소를 전신에 운반합니다. 게임에서 <b>부스트 코인</b>을 먹으면 10초간 고속 질주할 수 있습니다!
              </p>
            </div>

            {/* WBC */}
            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> 백혈구 (WBC)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                모양이 일정하지 않고 핵이 있습니다. 몸에 침입한 세균을 위족으로 감싸 잡아먹는 <b>식균 작용(식세포 작용)</b>을 합니다. 게임에서 세균 발견 시 <b>식균 버튼</b>으로 세균을 물리칠 수 있습니다!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
