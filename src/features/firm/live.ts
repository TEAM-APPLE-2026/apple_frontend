'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BackendError, call, friendlyError, listAll,
  type Group, type GroupStats, type MyProposalVote, type Notification, type Proposal,
} from '@/lib/live-api'

// 로펌 화면의 실제 데이터: 공동소송 그룹 · 내 제안서 · 익명 집계 · 선정 결과.
// 로펌은 그룹 참여자가 아니라서 투표 중에는 로펌 투표 pollId를 받을 수 없다.
// 선정되면 firm_selected 알림에 pollId가 오고, 그때 getMyProposalVoteSummary로 내 득표를 본다.

export type FirmProposalStatus = 'submitted' | 'voting' | 'selected' | 'not_selected' | 'withdrawn' | 'closed'

export type FirmGroupRow = {
  group: Group
  /** 이 그룹에 낸 내 제안서(철회 포함). 없으면 null */
  mine: Proposal | null
  /** 승인된 로펌만 받을 수 있다. 승인 전이면 null */
  stats: GroupStats | null
  status: FirmProposalStatus | null
  /** 선정됐을 때만: 내 제안서 득표 */
  myVotes: MyProposalVote | null
}

const SUIT_PHASES = ['proposal_collection', 'firm_vote', 'connected', 'closed']

/** 지금 제안서를 낼(고칠·철회할) 수 있는 그룹인지. 최종 판단은 서버가 한다. */
export const acceptsProposals = (g: Group) =>
  g.subStatus === 'proposal_collection' && !!g.proposalDeadline && new Date(g.proposalDeadline) > new Date()

function statusOf(group: Group, mine: Proposal | null, selectedPoll: string | undefined): FirmProposalStatus | null {
  if (!mine) return null
  if (selectedPoll) return 'selected'
  if (mine.status === 'withdrawn') return 'withdrawn'
  if (group.selectedFirmName || group.subStatus === 'connected') return 'not_selected'
  if (group.subStatus === 'firm_vote') return 'voting'
  if (group.subStatus === 'proposal_collection') return 'submitted'
  return 'closed'
}

async function stats(groupId: string): Promise<GroupStats | null> {
  try { return await call<GroupStats>('getGroupStats', { groupId }) } catch (e) {
    if (e instanceof BackendError && (e.code === 'FIRM_NOT_APPROVED' || e.code === 'NOT_FOUND')) return null
    throw e
  }
}

async function loadRow(group: Group, selected: Map<string, string>): Promise<FirmGroupRow> {
  const [proposals, st] = await Promise.all([listAll<Proposal>('listProposals', { groupId: group.id }), stats(group.id)])
  const mine = proposals[0] ?? null // 로펌에게는 본인 제안서만 온다(그룹·로펌당 1개)
  const pollId = selected.get(group.id)
  const myVotes = pollId && mine ? await call<MyProposalVote>('getMyProposalVoteSummary', { pollId }) : null
  return { group, mine, stats: st, status: statusOf(group, mine, pollId), myVotes }
}

async function selectedPolls() {
  const notices = await listAll<Notification>('listNotifications')
  const map = new Map<string, string>()
  for (const n of notices) if (n.type === 'firm_selected' && n.groupId && n.payload.poll_id && !map.has(n.groupId)) map.set(n.groupId, n.payload.poll_id)
  return map
}

/** 공동소송 그룹 전체(사건 탐색 · 내 제안서). votingCount: 아직 대응 방법 투표 중인 그룹 수 */
export function useFirmGroups() {
  const [rows, setRows] = useState<FirmGroupRow[] | null>(null)
  const [votingCount, setVotingCount] = useState(0)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setError('')
    try {
      const [groups, selected] = await Promise.all([listAll<Group>('listGroups'), selectedPolls()])
      const suit = groups.filter((g) => g.method === 'suit' && SUIT_PHASES.includes(g.subStatus))
      setVotingCount(groups.filter((g) => g.subStatus === 'method_vote').length)
      setRows(await Promise.all(suit.map((g) => loadRow(g, selected))))
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [])
  useEffect(() => { queueMicrotask(() => void load()) }, [load])
  return { rows, votingCount, error, reload: load }
}

/** 그룹 하나(그룹 보기 · 제안서 작성) */
export function useFirmGroup(groupId: string) {
  const [row, setRow] = useState<FirmGroupRow | null>(null)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setError('')
    try {
      const [group, selected] = await Promise.all([call<Group>('getGroup', { groupId }), selectedPolls()])
      setRow(await loadRow(group, selected))
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [groupId])
  useEffect(() => { queueMicrotask(() => void load()) }, [load])
  return { row, error, reload: load }
}

export const pct = (ratio: number | null) => (ratio === null ? null : Math.round(ratio * 100))
