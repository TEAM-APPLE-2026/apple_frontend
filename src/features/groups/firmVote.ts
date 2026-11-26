'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  call, friendlyError, listAll,
  type Group, type Membership, type Notification, type Proposal, type VoteOption, type VoteSummary,
} from '@/lib/live-api'

// 피해자 그룹의 로펌 선정 단계(제안 접수 → 로펌 투표 → 선정) 실제 데이터.
// 로펌 투표 pollId는 본인 알림(poll_started, kind=firm)에서 얻는다. 투표 마감·집계는 서버 Cron이 한다.

export type FirmStage =
  | 'not_suit' // 공동소송 그룹이 아님
  | 'collecting' // 제안 접수 중 (마감 전)
  | 'ready' // 제안 마감 지남 · 로펌 투표 열기 전
  | 'voting' // 로펌 투표 중
  | 'counting' // 마감 시간은 지났고 서버 집계 대기
  | 'retry' // 동점 · 투표 없음 · 취소 → 대표자가 다시 열 수 있음
  | 'selected' // 선정 완료

export type FirmVoteData = {
  group: Group
  membership: Membership | null
  proposals: Proposal[]
  vote: VoteSummary | null
  stage: FirmStage
}

async function latestFirmPoll(groupId: string): Promise<VoteSummary | null> {
  const notices = await listAll<Notification>('listNotifications')
  const notice = notices.find((n) => n.groupId === groupId && n.type === 'poll_started' && n.payload.kind === 'firm' && n.payload.poll_id)
  return notice ? call<VoteSummary>('getVoteSummary', { pollId: notice.payload.poll_id }) : null
}

function stageOf(group: Group, vote: VoteSummary | null): FirmStage {
  if (group.method !== 'suit') return 'not_suit'
  if (group.selectedFirmName || group.subStatus === 'connected') return 'selected'
  if (vote) {
    if (vote.isFinalized) return vote.state === 'closed' ? 'selected' : 'retry'
    if (new Date(vote.serverTime) >= new Date(vote.closesAt)) return 'counting'
    return 'voting'
  }
  const deadline = group.proposalDeadline ? new Date(group.proposalDeadline) : null
  return deadline && deadline <= new Date() ? 'ready' : 'collecting'
}

export function useFirmVote(groupId: string) {
  const [data, setData] = useState<FirmVoteData | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const group = await call<Group>('getGroup', { groupId })
      const membership = await call<Membership | null>('getMyMembership', { groupId })
      const active = membership && membership.leftAt === null ? membership : null
      // 참여자에게는 제출(submitted)된 제안서만 보인다
      const proposals = active && group.method === 'suit' ? await listAll<Proposal>('listProposals', { groupId }) : []
      const vote = active ? await latestFirmPoll(groupId) : null
      setData({ group, membership: active, proposals, vote, stage: stageOf(group, vote) })
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [groupId])

  useEffect(() => { queueMicrotask(() => void load()) }, [load])
  return { data, error, reload: load }
}

/** 제안서에 해당하는 투표 선택지 (선택지의 proposalId로 연결) */
export const optionOf = (vote: VoteSummary | null, proposalId: string): VoteOption | undefined =>
  vote?.options.find((o) => o.proposalId === proposalId)

/** 선정된 제안서 id. 투표 결과(winnerOptionId)를 우선하고, 없으면 null */
export const winnerProposalId = (vote: VoteSummary | null) =>
  vote?.isFinalized && vote.winnerOptionId ? vote.options.find((o) => o.optionId === vote.winnerOptionId)?.proposalId ?? null : null

export const RETRY_TEXT: Record<string, string> = {
  tied: '동점이 나와 로펌이 정해지지 않았어요. 대표자가 로펌 투표를 다시 열 수 있어요.',
  no_votes: '투표한 사람이 없어 로펌이 정해지지 않았어요. 대표자가 로펌 투표를 다시 열 수 있어요.',
  cancelled: '1위 로펌의 승인 상태가 바뀌어 선정이 취소됐어요. 대표자가 로펌 투표를 다시 열 수 있어요.',
}
