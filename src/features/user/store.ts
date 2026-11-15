'use client'

import { createSessionStore } from '@/lib/sessionStore'

// 일반 사용자 화면 시연 상태 (백엔드 연결 전)
export type UserState = {
  loggedIn: boolean
  /** 참여 중인 그룹 id ('new' = 피해 등록에서 새로 연 그룹) */
  joined: string[]
}

/** 시연 계정은 대표 예시 사건(△△ 통신사)에 이미 참여해 있음 */
const DEMO_JOINED = ['telecom']

const store = createSessionStore<UserState>('hande:user-demo', { loggedIn: false, joined: [] })

export const useUserState = store.useStore

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])

export const userActions = {
  login: () => store.set((s) => ({ loggedIn: true, joined: s.joined.reduce(add, DEMO_JOINED) })),
  join: (id: string) => store.set((s) => ({ loggedIn: true, joined: add(s.joined, id) })),
  createGroup: () => store.set((s) => ({ loggedIn: true, joined: add(s.joined, 'new') })),
  logout: store.reset,
}
