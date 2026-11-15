'use client'

import { createSessionStore } from '@/lib/sessionStore'
import { FIRMS, METHODS, type FirmId, type MethodId } from './dashboardData'

// 그룹 대시보드 시연 상태 (Figma U-23 ~ U-35)
// method: 대응 방법 투표 중 → firm: 공동소송 결정 · 로펌 투표 중 → selected: 로펌 선정 완료
export type Phase = 'method' | 'firm' | 'selected'

type GroupState = {
  phase: Phase
  methodVote: MethodId | null
  firmVote: FirmId | null
  toast: string | null
}

const store = createSessionStore<GroupState>('hande:group-demo', { phase: 'method', methodVote: null, firmVote: null, toast: null })

export const useGroupState = store.useStore

const VOTED = '투표했어요. 마감 전까지 바꿀 수 있어요'
const CANCELED = '투표를 취소했어요'

export const groupActions = {
  toast: (toast: string | null) => store.set({ toast }),
  voteMethod: (id: MethodId) => store.set((s) => (s.methodVote === id ? { methodVote: null, toast: CANCELED } : { methodVote: id, toast: VOTED })),
  voteFirm: (id: FirmId) => store.set((s) => (s.firmVote === id ? { firmVote: null, toast: CANCELED } : { firmVote: id, toast: VOTED })),
  /** [데모] 대응 방법 투표 마감 → 공동소송으로 결정 */
  closeMethodVote: () => store.set({ phase: 'firm', toast: '대응 방법 투표가 마감됐어요 · 공동소송으로 정해졌어요' }),
  /** [데모] 로펌 투표 마감 → 마 법무법인 선정 */
  closeFirmVote: () => store.set({ phase: 'selected', toast: `로펌 투표가 마감됐어요 · 선정된 로펌: ${FIRMS.ma.name}` }),
  reset: store.reset,
}

/** 표 수 = 다른 참여자 표(예시) + 내 표 */
export const methodVotes = (id: MethodId, mine: MethodId | null) => METHODS[id].base + (mine === id ? 1 : 0)
export const firmVotes = (id: FirmId, mine: FirmId | null) => FIRMS[id].base + (mine === id ? 1 : 0)
