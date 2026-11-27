'use client'

import { useEffect, useState } from 'react'

// 모든 투표(대표자 · 대응 방법 · 로펌)의 화면 상태를 여기 한 곳에서 계산한다.
// 시작 대기: 지금 < 시작 시각 · 투표 중: 시작 시각 ≤ 지금 < 마감 시각 · 마감: 마감 시각 ≤ 지금 또는 서버가 종료 처리
// 투표 버튼은 '투표 중'일 때만 누를 수 있다. 서버(cast_vote)도 시작 전 POLL_NOT_OPEN, 마감 후 POLL_CLOSED로 거부한다.

export type PollPhase = 'waiting' | 'open' | 'closed'

type PollTimes = { state: string; opensAt: string; closesAt: string; clockOffset?: number }

const ENDED = ['closed', 'tied', 'no_votes', 'cancelled']
/** 화면을 열어 둔 동안 상태를 다시 계산하는 간격 */
export const POLL_TICK_MS = 30_000

export function pollPhaseAt(vote: PollTimes, now: number): PollPhase {
  if (ENDED.includes(vote.state)) return 'closed'
  if (now < Date.parse(vote.opensAt)) return 'waiting'
  if (now >= Date.parse(vote.closesAt)) return 'closed'
  return 'open'
}

/** 30초마다 바뀌는 현재 시각 */
function useNow(intervalMs = POLL_TICK_MS) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/**
 * 투표 응답에 기기 시계 차이(서버 시각 - 기기 시각)를 붙인다. 응답을 받은 직후(비동기 코드)에서 호출한다.
 * 기기 시계가 틀려도 시작·마감 판단이 서버 기준에 맞도록 하기 위함이다.
 */
export function withClock<T extends { serverTime: string }>(vote: T): T & { clockOffset: number } {
  return { ...vote, clockOffset: Date.parse(vote.serverTime) - Date.now() }
}

/** 투표의 현재 상태(30초마다 재계산). vote가 없으면 null. */
export function usePollPhase(vote: PollTimes | null | undefined): PollPhase | null {
  const now = useNow()
  if (!vote) return null
  return pollPhaseAt(vote, now + (vote.clockOffset ?? 0))
}

export const PHASE_LABEL: Record<PollPhase, string> = { waiting: '시작 대기', open: '투표 중', closed: '마감' }
