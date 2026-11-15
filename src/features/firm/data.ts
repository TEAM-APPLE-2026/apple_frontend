// 로펌 화면 목업 데이터 (백엔드 연결 전). 모든 수치는 [예시]입니다.

export const FIRM = { name: '[예시] 마 법무법인' }

export type FirmGroup = {
  id: string
  title: string
  harm: string
  members: number
  secondary: number
  /** 공동소송 득표율 (%) */
  share: number
  evidence: number
  deadline: string
  proposals: number
}

// 정렬 기본값: 제안 마감 빠른 순
export const FIRM_GROUPS: FirmGroup[] = [
  { id: 'insurance', title: '[예시] ◎◎ 보험사 고객정보 유출', harm: '개인정보 유출', members: 1208, secondary: 214, share: 71, evidence: 76, deadline: '11-12', proposals: 3 },
  { id: 'telecom', title: '[예시] △△ 통신사 고객정보 유출', harm: '개인정보 유출', members: 214, secondary: 37, share: 55, evidence: 81, deadline: '11-25', proposals: 2 },
  { id: 'travel', title: '[예시] ▲▲ 여행사 예약정보 유출', harm: '개인정보 유출', members: 302, secondary: 41, share: 58, evidence: 69, deadline: '11-28', proposals: 0 },
]

/** 시연 시작 시 아직 대응 방법 투표 중인 그룹 (F-01 안내 문구) */
export const VOTING_GROUP_ID = 'telecom'

export const HARM_TYPES = ['개인정보 유출', '위치정보 침해', '의료정보 유출']

export const formatDeadline = (d: string) => {
  const [m, day] = d.split('-').map(Number)
  return `[예시] ${m}월 ${day}일`
}

export const findGroup = (id: string) => FIRM_GROUPS.find((g) => g.id === id)
