import React, { useState, useEffect } from 'react';
import { CharacterType, MapType, StudentProfile, RankingRecord } from '../types/game';
import { getTopRankings } from '../firebase/services';
import { Zap, ShieldCheck, Heart, Activity, Play, Trophy, User, Lock, Award, Clock } from 'lucide-react';

interface HomeViewProps {
  currentStudent: StudentProfile | null;
  selectedCharacter: CharacterType;
  selectedMap: MapType;
  onSelectCharacter: (char: CharacterType) => void;
  onSelectMap: (map: MapType) => void;
  onStartMatch: (nickname: string, password: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  onLogout: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentStudent,
  selectedCharacter,
  selectedMap,
  onSelectCharacter,
  onSelectMap,
  onStartMatch,
  isLoading,
  errorMessage,
  onLogout,
}) => {
  const [nickname, setNickname] = useState<string>(currentStudent?.nickname || '');
  const [password, setPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [rankings, setRankings] = useState<RankingRecord[]>([]);

  // Update nickname if currentStudent changes
  useEffect(() => {
    if (currentStudent) {
      setNickname(currentStudent.nickname);
    }
  }, [currentStudent]);

  // Load top rankings from Firestore for selected map
  useEffect(() => {
    let isMounted = true;
    getTopRankings(selectedMap, 5).then(data => {
      if (isMounted) setRankings(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const trimmedNickname = nickname.trim();
    const trimmedPassword = password.trim();

    if (!currentStudent && (!trimmedNickname || !trimmedPassword)) {
      setValidationError('닉네임과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!currentStudent && trimmedNickname.length > 20) {
      setValidationError('닉네임은 20자 이하로 입력해주세요.');
      return;
    }

    onStartMatch(trimmedNickname, trimmedPassword);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Hero Banner */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>동물의 순환계 4인 실시간 과학 레이스</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          혈관을 질주하는 <span className="text-rose-500">순환계 레이서</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          적혈구의 산소 부스트와 백혈구의 식균 작용을 활용하여, 온몸순환과 허파순환 혈관 코스를 누구보다 빠르게 완주해보세요!
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Step 1: Student Account Login & Profile Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>학생 로그인 & 계정 설정</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {currentStudent ? '자동 로그인 세션 활성화 중' : '처음이면 자동 가입'}
            </span>
          </div>

          {currentStudent ? (
            /* Logged in state display */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-850 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold text-xl">
                  {currentStudent.nickname.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">
                      {currentStudent.nickname} 학생
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      연결됨
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      총 <b>{currentStudent.wins}</b>승 ({currentStudent.totalRaces}전)
                    </span>
                    {currentStudent.bestSystemicTime > 0 && (
                      <span className="text-[11px] text-rose-300">
                        온몸순환 최고: {currentStudent.bestSystemicTime}s
                      </span>
                    )}
                    {currentStudent.bestPulmonaryTime > 0 && (
                      <span className="text-[11px] text-cyan-300">
                        허파순환 최고: {currentStudent.bestPulmonaryTime}s
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-rose-400 underline transition-colors cursor-pointer"
              >
                다른 학생으로 로그인 / 새 계정 생성
              </button>
            </div>
          ) : (
            /* Login / Register Inputs */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nickname Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    학생 닉네임 (이름 또는 별명)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="예: 민수, 적혈구마스터"
                    maxLength={20}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    비밀번호 (재접속 시 이어서 플레이)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호 입력 (예: 1234)"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                💡 <b>안내:</b> 같은 닉네임이더라도 <b>비밀번호로 각 학생을 개별 식별</b>합니다. 처음 방문 시 원하는 닉네임과 비밀번호를 정하면 Firebase에 기록되어, 앱을 껐다 켜도 동일한 비밀번호로 이어서 플레이할 수 있습니다.
              </p>
            </div>
          )}

          {(validationError || errorMessage) && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 px-3 py-2 rounded-xl">
              {validationError || errorMessage}
            </div>
          )}
        </div>

        {/* Step 2: Character Selection (적혈구 vs 백혈구) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>캐릭터 선택 (적혈구 vs 백혈구)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              캐릭터마다 고유한 특수 능력이 있습니다
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* RBC Option */}
            <div
              onClick={() => onSelectCharacter('RBC')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                selectedCharacter === 'RBC'
                  ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500 shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/40'
                  : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-xl shadow-md shadow-rose-600/40">
                    🔴
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">적혈구 (RBC)</h4>
                    <span className="text-[11px] text-rose-400 font-semibold">
                      산소 운반 & 부스트 가속
                    </span>
                  </div>
                </div>
                {selectedCharacter === 'RBC' && (
                  <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    선택됨
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                혈관 속 <b>부스트 코인(산소 에너지)</b>을 먹으면 하단에 <b>[⚡ 부스트 블럭]</b>이 활성화되어 <b>10초 동안 폭발적으로 가속</b>합니다!
              </p>
            </div>

            {/* WBC Option */}
            <div
              onClick={() => onSelectCharacter('WBC')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                selectedCharacter === 'WBC'
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/40'
                  : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl shadow-md shadow-cyan-600/40">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">백혈구 (WBC)</h4>
                    <span className="text-[11px] text-cyan-400 font-semibold">
                      면역 방어 & 식균 작용
                    </span>
                  </div>
                </div>
                {selectedCharacter === 'WBC' && (
                  <span className="text-xs font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                    선택됨
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                혈관 속 <b>장애물(세균)</b> 출현 시 하단에 <b>[🛡️ 식균 버튼]</b>이 활성화되어 세균을 집어삼키고 감속 없이 돌파합니다!
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Map Selection (온몸순환 vs 허파순환) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>맵 선택 (온몸순환 vs 허파순환)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              같은 맵을 선택한 유저들과 실시간 매칭됩니다
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Systemic Map */}
            <div
              onClick={() => onSelectMap('systemic')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                selectedMap === 'systemic'
                  ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500 shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/40'
                  : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h4 className="font-black text-white text-base">온몸순환 (체순환)</h4>
                </div>
                {selectedMap === 'systemic' && (
                  <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    선택됨
                  </span>
                )}
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-xs font-mono text-rose-300 border border-rose-500/30">
                좌심실 ➔ 대동맥 ➔ 온몸 모세혈관 ➔ 대정맥 ➔ 우심방
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                심장의 가장 강력한 방인 <b>좌심실</b>에서 출발하여, 온몸에 산소와 영양소를 공급하고 <b>우심방</b>에 먼저 도착하면 승리!
              </p>
            </div>

            {/* Pulmonary Map */}
            <div
              onClick={() => onSelectMap('pulmonary')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                selectedMap === 'pulmonary'
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/40'
                  : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-black text-white text-base">허파순환 (폐순환)</h4>
                </div>
                {selectedMap === 'pulmonary' && (
                  <span className="text-xs font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                    선택됨
                  </span>
                )}
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-xs font-mono text-cyan-300 border border-cyan-500/30">
                우심실 ➔ 허파동맥 ➔ 폐모세혈관 ➔ 허파정맥 ➔ 좌심방
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b>우심실</b>에서 출발하여, 허파꽈리에서 기체 교환을 마친 후 신선한 산소를 머금고 <b>좌심방</b>에 먼저 도착하면 승리!
              </p>
            </div>
          </div>
        </div>

        {/* Live Leaderboard for Selected Map */}
        {rankings.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                {selectedMap === 'systemic' ? '온몸순환' : '허파순환'} 명예의 전당 Top 5
              </span>
              <span>Firebase 실시간 기록</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {rankings.slice(0, 3).map((r, i) => (
                <div
                  key={r.id || i}
                  className="bg-slate-850 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono">#{i + 1}</span>
                    <span className="text-white font-medium truncate max-w-[90px]">
                      {r.nickname}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({r.character === 'RBC' ? '적혈구' : '백혈구'})
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {r.finishTimeSeconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Prominent Start Button as requested */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 px-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/40 transform active:scale-98 transition-all cursor-pointer border-2 border-amber-300"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-white">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>학생 계정 확인 및 레이스 매칭 중...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-6 h-6 fill-white" />
              <span>게임 시작 (4인 레이스 매칭)</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};
