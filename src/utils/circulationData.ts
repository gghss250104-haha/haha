import { StageDefinition, MapType } from '../types/game';

export const SYSTEMIC_STAGES: StageDefinition[] = [
  {
    name: 'left_ventricle',
    koreanName: '좌심실 (출발지)',
    description: '심장에서 가장 두꺼운 근육벽! 높은 압력으로 온몸으로 혈액을 힘차게 박출합니다.',
    vesselType: 'heart_chamber',
    oxygenated: true,
    wallColor: '#b91c1c',
    bloodColor: '#ef4444',
    startProgress: 0,
    endProgress: 15,
  },
  {
    name: 'aorta',
    koreanName: '대동맥',
    description: '몸에서 가장 굵은 혈관! 높은 혈압을 견디는 두껍고 탄력 있는 혈관벽으로 산소가 풍부한 동맥혈이 흐릅니다.',
    vesselType: 'artery',
    oxygenated: true,
    wallColor: '#dc2626',
    bloodColor: '#ef4444',
    startProgress: 15,
    endProgress: 45,
  },
  {
    name: 'systemic_capillaries',
    koreanName: '온몸의 모세혈관',
    description: '적혈구 한 개가 겨우 지나갈 만큼 좁은 혈관망! 조직 세포에 산소와 영양소를 공급하고 이산화탄소와 노폐물을 수거합니다.',
    vesselType: 'capillary',
    oxygenated: false, // Transitions during this stage
    wallColor: '#7c3aed',
    bloodColor: '#9333ea',
    startProgress: 45,
    endProgress: 75,
  },
  {
    name: 'vena_cava',
    koreanName: '대정맥',
    description: '온몸을 돌고 난 정맥혈이 심장으로 모이는 혈관! 혈압이 매우 낮아 판막(Valve)이 있어 혈액의 역류를 막습니다.',
    vesselType: 'vein',
    oxygenated: false,
    wallColor: '#1d4ed8',
    bloodColor: '#2563eb',
    startProgress: 75,
    endProgress: 95,
  },
  {
    name: 'right_atrium',
    koreanName: '우심방 (결승선)',
    description: '대정맥을 거쳐 온몸을 돌고 온 산소가 부족한 혈액이 심장으로 귀환하는 첫 번째 방입니다.',
    vesselType: 'heart_chamber',
    oxygenated: false,
    wallColor: '#1e3a8a',
    bloodColor: '#1e40af',
    startProgress: 95,
    endProgress: 100,
  },
];

export const PULMONARY_STAGES: StageDefinition[] = [
  {
    name: 'right_ventricle',
    koreanName: '우심실 (출발지)',
    description: '온몸을 돌고 온 산소가 적은 혈액을 허파(폐)를 향해 밀어내는 심장 아랫방입니다.',
    vesselType: 'heart_chamber',
    oxygenated: false,
    wallColor: '#1e40af',
    bloodColor: '#2563eb',
    startProgress: 0,
    endProgress: 15,
  },
  {
    name: 'pulmonary_artery',
    koreanName: '허파동맥 (폐동맥)',
    description: '동맥이지만 산소가 적은 정맥혈이 흐르는 특별한 혈관! 심장에서 폐로 혈액을 보냅니다.',
    vesselType: 'artery',
    oxygenated: false,
    wallColor: '#2563eb',
    bloodColor: '#3b82f6',
    startProgress: 15,
    endProgress: 45,
  },
  {
    name: 'pulmonary_capillaries',
    koreanName: '허파의 모세혈관 (폐포 모세혈관)',
    description: '수억 개의 허파꽈리(폐포)를 감싸고 기체 교환! 이산화탄소를 내보내고 신선한 산소를 흡수하여 선홍색 동맥혈로 변신합니다.',
    vesselType: 'capillary',
    oxygenated: true,
    wallColor: '#059669',
    bloodColor: '#10b981',
    startProgress: 45,
    endProgress: 75,
  },
  {
    name: 'pulmonary_vein',
    koreanName: '허파정맥 (폐정맥)',
    description: '정맥이지만 산소가 가장 풍부한 동맥혈이 흐르는 혈관! 깨끗해진 혈액을 심장으로 보냅니다.',
    vesselType: 'vein',
    oxygenated: true,
    wallColor: '#dc2626',
    bloodColor: '#ef4444',
    startProgress: 75,
    endProgress: 95,
  },
  {
    name: 'left_atrium',
    koreanName: '좌심방 (결승선)',
    description: '폐에서 산소를 가득 머금은 신선한 혈액이 심장으로 들어오는 방! 다음 온몸순환을 준비합니다.',
    vesselType: 'heart_chamber',
    oxygenated: true,
    wallColor: '#991b1b',
    bloodColor: '#dc2626',
    startProgress: 95,
    endProgress: 100,
  },
];

export function getStagesForMap(mapType: MapType): StageDefinition[] {
  return mapType === 'systemic' ? SYSTEMIC_STAGES : PULMONARY_STAGES;
}

export function getCurrentStage(progress: number, mapType: MapType): StageDefinition {
  const stages = getStagesForMap(mapType);
  for (const stage of stages) {
    if (progress >= stage.startProgress && progress <= stage.endProgress) {
      return stage;
    }
  }
  return stages[stages.length - 1];
}

// Generate pre-seeded items (Coins & Bacteria) along the track
export function generateTrackItems(mapType: MapType): Array<{
  id: number;
  type: 'coin' | 'bacteria';
  progress: number;
  lane: number;
}> {
  const items: Array<{ id: number; type: 'coin' | 'bacteria'; progress: number; lane: number }> = [];
  let id = 1;

  // Distribute 18 items across 10% to 90% progress
  const progressPoints = [
    12, 17, 23, 28, 34, 40, 46, 52, 57, 63, 68, 73, 78, 83, 88, 92
  ];

  progressPoints.forEach((p, index) => {
    // Lanes alternating between -1 (left), 0 (center), 1 (right)
    const lane = (index % 3) - 1;
    // Both coins and bacteria appear on the track so RBC can get coins and WBC can attack bacteria
    const type: 'coin' | 'bacteria' = index % 2 === 0 ? 'coin' : 'bacteria';
    items.push({
      id: id++,
      type,
      progress: p,
      lane,
    });
  });

  return items;
}
