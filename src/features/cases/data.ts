import type { BadgeTone } from '@/components/common/Badge'

// 사건 목업 데이터 (Figma U-13 ~ U-20). 수치는 모두 [예시]입니다.

export type CaseStatus = 'recruiting' | 'connecting' | 'progress' | 'closed'

export const STATUS: Record<CaseStatus, { label: string; tone: BadgeTone; stage: number }> = {
  recruiting: { label: '모집 중', tone: 'line', stage: 0 },
  connecting: { label: '대응 연결 중', tone: 'blue', stage: 1 },
  progress: { label: '사건 진행 중', tone: 'white', stage: 2 },
  closed: { label: '종결', tone: 'dim', stage: 3 },
}

export const STAGES = ['모집 중', '대응 연결 중', '사건 진행 중', '종결']

export type Case = {
  id: string
  title: string
  harm: string
  status: CaseStatus
  count: number
  goal?: number
  /** 목록의 모집 마감 칸 (날짜 · "마감" · "정하는 중") */
  deadline: string
  /** 상세의 모집 마감 (목록과 다를 때만) */
  deadlineDetail?: string
  created: string
  stageText: string
  /** 종결 사건 결과 */
  result?: string
}

export const CASES: Case[] = [
  { id: 'hospital', title: '[예시] ☆☆ 병원 예약정보 유출', harm: '의료정보 유출', status: 'progress', count: 523, deadline: '마감', created: '2026.08.14', stageText: '모집 마감 · 선정 로펌과 진행 중' },
  { id: 'telecom', title: '[예시] △△ 통신사 고객정보 유출', harm: '개인정보 유출', status: 'connecting', count: 214, goal: 300, deadline: '2026.11.30', created: '2026.10.08', stageText: '대응 방법 투표 중 · 대표자 선정됨' },
  { id: 'game', title: '[예시] ▽▽ 게임사 계정정보 유출', harm: '개인정보 유출', status: 'closed', count: 168, deadline: '마감', deadlineDetail: '2026.06.30', created: '2026.04.11', stageText: '종결 · 조정 성립 · 1인당 10만 원', result: '조정 성립 · 1인당 10만 원' },
  { id: 'shop', title: '[예시] ○○ 쇼핑몰 회원정보 유출', harm: '개인정보 유출', status: 'recruiting', count: 87, goal: 100, deadline: '2026.11.20', created: '2026.10.21', stageText: '대표자 선정됨 · 참여자 모집 중' },
  { id: 'card', title: '[예시] □□ 카드사 결제정보 유출', harm: '개인정보 유출', status: 'recruiting', count: 46, goal: 50, deadline: '2026.11.15', created: '2026.10.27', stageText: '대표자 선정됨 · 50명이 모이면 집단 신청 가능' },
  { id: 'location', title: '[예시] ◇◇ 앱 위치정보 무단 수집', harm: '위치정보 침해', status: 'recruiting', count: 12, deadline: '정하는 중', created: '2026.11.02', stageText: '대표자 선정됨 · 목표 인원은 그룹에서 정하는 중' },
]

/** 시연에서 참여할 수 있는 대표 예시 사건 */
export const DEMO_CASE_ID = 'telecom'

export const HARMS = ['개인정보 유출', '위치정보 침해', '의료정보 유출']

export const findCase = (id: string) => CASES.find((c) => c.id === id)

export const formatCount = (c: Pick<Case, 'count' | 'goal'>) =>
  c.goal ? `${c.count.toLocaleString()} / ${c.goal.toLocaleString()}명` : `${c.count.toLocaleString()}명`
