'use client'

import { useSyncExternalStore } from 'react'

// 로펌 화면 공통 상태: 로그인 알림과 토스트만 둔다. 제안서 · 그룹 데이터는 서버에서 읽는다(./live.ts).
// loggedIn은 새로고침 때 로그인 알림이 다시 뜨지 않도록 sessionStorage에 보관한다.

type State = {
  loggedIn: boolean
  toast: string | null
}

const KEY = 'hande:firm-session'
const INITIAL: State = { loggedIn: false, toast: null }

let state: State = INITIAL
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    state = { ...INITIAL, loggedIn: sessionStorage.getItem(KEY) === '1' }
  } catch {
    /* 저장소를 못 쓰면 처음 상태로 */
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next }
  try {
    if (state.loggedIn) sessionStorage.setItem(KEY, '1')
    else sessionStorage.removeItem(KEY)
  } catch {
    /* 저장 실패는 무시 */
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

export const firmActions = {
  showToast: (toast: string) => { load(); set({ toast }) },
  /** 실제로 로그아웃 → 로그인으로 바뀔 때만 알림. 세션 새로고침(사업자 조회 등)마다 다시 뜨지 않게 한다. */
  login: (toast: string) => { load(); if (!state.loggedIn) set({ loggedIn: true, toast }) },
  clearToast: () => set({ toast: null }),
  reset: () => set({ ...INITIAL }),
}
