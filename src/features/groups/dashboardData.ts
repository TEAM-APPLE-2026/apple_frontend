// 그룹 대시보드 목업 데이터 (Figma U-23 ~ U-29 · U-36 ~ U-38). 수치는 모두 [예시]입니다.
// 로펌 제안서 · 투표(U-30 ~ U-35)는 실제 데이터를 쓴다.

export type MethodId = 'mediation' | 'lawsuit'

export const GROUP = {
  title: '[예시] △△ 통신사 고객정보 유출',
  leader: '대표자 박OO',
  created: '개설 10월 14일',
  members: 214,
  goal: 300,
  voters: 128,
  methodDeadline: '[예시] 11월 20일 오후 6시 마감',
}

export const METHODS: Record<MethodId, { name: string; voteName: string; desc: string; base: number; recommended?: boolean }> = {
  mediation: { name: '개인정보 분쟁조정', voteName: '분쟁조정', desc: '비용 무료 · 개인정보 유출 사건 전용 절차', base: 58, recommended: true },
  lawsuit: { name: '공동소송', voteName: '공동소송', desc: '착수금 · 성공보수 · 로펌 수임 제안서를 비교해 피해자 투표로 정해요', base: 70 },
}
/** 시연에서 대응 방법 투표는 공동소송으로 결정됨 */
export const METHOD_WINNER: MethodId = 'lawsuit'

export const KPIS = [
  { label: '참여자', value: '214', unit: '명', caption: '이번 주 +18명', up: true },
  { label: '2차 피해', value: '37', unit: '명', caption: '참여자의 17%' },
  { label: '증거 보유율', value: '81', unit: '%', caption: '173명 제출' },
  { label: '비슷한 조정 사례', value: '46', unit: '건', caption: '성립 63%' },
]

export const MILESTONES = [
  { label: '10명 달성 · 대표자 선정', value: '10월 16일' },
  { label: '50명 달성 · 집단분쟁조정 신청 가능', value: '10월 21일' },
  { label: '300명 · 그룹 목표', value: '86명 남음' },
]

export const MY_INFO = [
  { label: '유출된 정보', value: '이름 · 연락처 · 주소' },
  { label: '2차 피해', value: '택배 사칭 스미싱 문자 3회' },
]

export const NOTICE = {
  title: '[공지] 대응 방법 투표를 시작했어요',
  meta: '대표자 박OO · 10월 30일',
  body: '투표 전에 대응 방법 탭에서 두 방법의 비용과 차이를 꼭 확인해 주세요.',
}

// U-36 ~ U-38 새 그룹 (참여 1명 · 대표자 선정 전)
export const NEW_GROUP = {
  created: '개설 2026.11.10',
  members: 1,
  leaderGoal: 10,
  milestones: [
    { label: '10명 · 대표자 선정 · 대응 방법 투표 열림', value: '9명 남음' },
    { label: '50명 · 집단분쟁조정 신청 가능', value: '49명 남음' },
  ],
}

export const STAGE_NAMES = ['모집 중', '대응 연결 중', '사건 진행 중', '종결']
