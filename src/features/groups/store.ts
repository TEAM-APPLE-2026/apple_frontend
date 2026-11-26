'use client'

import { createSessionStore } from '@/lib/sessionStore'
import { METHODS, type MethodId } from './dashboardData'

// 그룹 대시보드 시연 상태 (Figma U-23 ~ U-29, 대응 방법 투표만)
// 로펌 투표 · 선정(U-30 ~ U-35)은 실제 데이터로 연결했다(FirmsPanel.tsx, firmVote.ts).
export type Phase = 'method'

type GroupState = {
  phase: Phase
  methodVote: MethodId | null
  toast: string | null
}

const store = createSessionStore<GroupState>('hande:group-demo', { phase: 'method', methodVote: null, toast: null })

export const useGroupState = store.useStore

const VOTED = '투표했어요. 마감 전까지 바꿀 수 있어요'
const CANCELED = '투표를 취소했어요'

export const groupActions = {
  toast: (toast: string | null) => store.set({ toast }),
  voteMethod: (id: MethodId) => store.set((s) => (s.methodVote === id ? { methodVote: null, toast: CANCELED } : { methodVote: id, toast: VOTED })),
  reset: store.reset,
}

/** 표 수 = 다른 참여자 표(예시) + 내 표 */
export const methodVotes = (id: MethodId, mine: MethodId | null) => METHODS[id].base + (mine === id ? 1 : 0)
