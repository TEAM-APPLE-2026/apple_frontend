'use client'

import { useSyncExternalStore } from 'react'
import { VOTING_GROUP_ID } from './data'

// 로펌 화면 시연 상태. 탭을 닫으면 처음으로 돌아가도록 sessionStorage에 보관.
// 백엔드 연결 시 이 모듈을 API 호출로 바꾸면 됩니다.

export type ProposalStatus = 'submitted' | 'voting' | 'selected'

export type Proposal = {
  groupId: string
  fee: string
  successFee: string
  period: string
  lawyers: string
  leadLawyer: string
  strategy: string
  submittedAt: string
  status: ProposalStatus
}

type State = {
  loggedIn: boolean
  /** 공동소송으로 정해진 그룹 id 목록 */
  lawsuitGroups: string[]
  proposals: Proposal[]
  toast: string | null
}

const KEY = 'hande:firm-demo'
const INITIAL: State = { loggedIn: false, lawsuitGroups: ['insurance', 'travel'], proposals: [], toast: null }

let state: State = INITIAL
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) state = { ...INITIAL, ...JSON.parse(raw), toast: null }
  } catch {
    /* 저장된 값이 깨졌으면 처음 상태로 */
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next }
  try {
    const { toast: _toast, ...persist } = state
    void _toast
    sessionStorage.setItem(KEY, JSON.stringify(persist))
  } catch {
    /* 저장 실패는 무시 (시연용) */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  load()
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useFirmState() {
  return useSyncExternalStore(subscribe, () => (load(), state), () => INITIAL)
}

const NEXT: Record<ProposalStatus, ProposalStatus> = { submitted: 'voting', voting: 'selected', selected: 'selected' }

export const firmActions = {
  showToast: (toast: string) => { load(); set({ toast }) },
  login: (toast: string) => { load(); set({ loggedIn: true, toast }) },
  clearToast: () => set({ toast: null }),
  /** [시연] 투표 중이던 그룹을 공동소송으로 확정 (F-01 → F-02) */
  closeVote: () => set({ lawsuitGroups: [...new Set([...state.lawsuitGroups, VOTING_GROUP_ID])] }),
  submitProposal: (p: Omit<Proposal, 'submittedAt' | 'status'>) => {
    const d = new Date()
    const submittedAt = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    set({
      proposals: [...state.proposals.filter((x) => x.groupId !== p.groupId), { ...p, submittedAt, status: 'submitted' }],
      toast: '수임 제안서를 제출했습니다',
    })
  },
  /** [시연] 제출됨 → 피해자 투표 중 → 선정됨 (F-09 → F-10 → F-11) */
  advanceProposal: (groupId: string) =>
    set({ proposals: state.proposals.map((p) => (p.groupId === groupId ? { ...p, status: NEXT[p.status] } : p)) }),
  reset: () => set({ ...INITIAL }),
}
