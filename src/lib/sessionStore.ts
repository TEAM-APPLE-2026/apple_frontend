'use client'

import { useSyncExternalStore } from 'react'

// 시연용 상태 저장소: 탭을 닫으면 처음 상태로 돌아가도록 sessionStorage에 보관.
// 서버 렌더링 때는 initial 값을 쓰고, 하이드레이션 뒤 저장된 값으로 바뀝니다.
export function createSessionStore<T extends object>(key: string, initial: T) {
  let state = initial
  let loaded = false
  const listeners = new Set<() => void>()

  const load = () => {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
      const raw = sessionStorage.getItem(key)
      if (raw) state = { ...initial, ...JSON.parse(raw) }
    } catch {
      /* 저장된 값이 깨졌으면 처음 상태로 */
    }
  }

  const set = (next: Partial<T> | ((s: T) => Partial<T>)) => {
    load()
    state = { ...state, ...(typeof next === 'function' ? next(state) : next) }
    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* 저장 실패는 무시 (시연용) */
    }
    listeners.forEach((l) => l())
  }

  const subscribe = (l: () => void) => {
    load()
    listeners.add(l)
    return () => listeners.delete(l)
  }

  const useStore = () => useSyncExternalStore(subscribe, () => (load(), state), () => initial)
  const get = () => (load(), state)
  const reset = () => set(initial)

  return { useStore, get, set, reset }
}
