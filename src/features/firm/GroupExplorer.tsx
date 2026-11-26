'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { useSession } from '@/features/auth/SessionProvider'
import { formatDateTime } from '@/lib/live-api'
import { acceptsProposals, pct, useFirmGroups, type FirmGroupRow } from './live'
import s from '@/components/layout/Page.module.css'
import { routes } from '@/lib/routes'

const SORTS = { deadline: '제안 마감 빠른 순', members: '참여 많은 순', evidence: '증거 보유율 높은 순' } as const
type SortKey = keyof typeof SORTS
// 백엔드 harmType은 현재 privacy_leak 하나
const HARM_TYPES: Record<string, string> = { privacy_leak: '개인정보 유출' }

const deadlineTime = (r: FirmGroupRow) => (r.group.proposalDeadline ? new Date(r.group.proposalDeadline).getTime() : Infinity)

/** 승인 · 사업자 상태 한 줄 (사건 탐색 상단) */
export function FirmStatusLine() {
  const { profile } = useSession()
  const firm = profile?.firm
  if (!firm) return null
  const ok = firm.approvalStatus === 'approved' && firm.bizStatus === 'active'
  return ok
    ? <p className={s.statusOk}><Icon name="status-check" size={16} />승인된 로펌 · 사업자 확인 완료</p>
    : <p className={s.note}>아직 제안서를 낼 수 없어요. 운영자 승인과 사업자 확인(계속사업자)이 끝나야 해요. <Link href="/firm/profile">로펌 정보에서 확인하기</Link></p>
}

// F-01 사건 탐색 · F-02 공동소송 그룹 · F-03 제안서 제출 후
export default function GroupExplorer() {
  const { rows, votingCount, error, reload } = useFirmGroups()
  const [harm, setHarm] = useState('')
  const [sort, setSort] = useState<SortKey>('deadline')

  const list = useMemo(() => {
    const filtered = (rows ?? []).filter((r) => !harm || r.group.harmType === harm)
    return [...filtered].sort((a, b) =>
      sort === 'members' ? b.group.memberCount - a.group.memberCount
        : sort === 'evidence' ? (b.stats?.evidenceRatio ?? -1) - (a.stats?.evidenceRatio ?? -1)
          : deadlineTime(a) - deadlineTime(b),
    )
  }, [rows, harm, sort])

  return (
    <>
      <div className={s.filters}>
        <label className={s.filter}>
          피해 유형
          <select className={s.select} value={harm} onChange={(e) => setHarm(e.target.value)}>
            <option value="">전체</option>
            {Object.entries(HARM_TYPES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
        <label className={s.filter}>
          정렬
          <select className={s.select} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
      </div>

      {error && <p role="alert" className={s.note}>{error} <Button variant="chip" size="sm" onClick={() => void reload()}>다시 불러오기</Button></p>}

      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th scope="col">그룹</th>
              <th scope="col" style={{ width: 116 }}>피해 유형</th>
              <th scope="col" className={s.right} style={{ width: 86 }}>참여</th>
              <th scope="col" className={s.right} style={{ width: 86 }}>2차 피해</th>
              <th scope="col" style={{ width: 120 }}>증거 보유율</th>
              <th scope="col" style={{ width: 120 }}>제안 마감</th>
              <th scope="col" className={s.right} style={{ width: 96 }}>내 제안</th>
              <th scope="col"><span className="sr-only">작업</span></th>
            </tr>
          </thead>
          <tbody>
            {!rows && !error && <tr><td colSpan={8} className={s.note}>공동소송 그룹을 불러오고 있습니다.</td></tr>}
            {rows && list.length === 0 && (
              <tr><td colSpan={8} className={s.note}>조건에 맞는 그룹이 없습니다.</td></tr>
            )}
            {list.map(({ group: g, mine, stats }) => {
              const submitted = mine?.status === 'submitted'
              const evidence = pct(stats?.evidenceRatio ?? null)
              const open = acceptsProposals(g)
              return (
                <tr key={g.id}>
                  <th scope="row" className={s.groupName}><Link href={routes.firmGroupView(g.id)}>{g.name}</Link></th>
                  <td>{HARM_TYPES[g.harmType] ?? g.harmType}</td>
                  <td className={s.right}>{g.memberCount.toLocaleString()}명</td>
                  <td className={s.right}>{stats ? `${stats.secondaryYesCount.toLocaleString()}명` : '-'}</td>
                  <td>
                    {evidence === null ? '-' : (
                      <span className={s.share}>
                        <span className={s.shareBar} aria-hidden><span className={s.shareFill} style={{ width: `${evidence}%` }} /></span>
                        {evidence}%
                      </span>
                    )}
                  </td>
                  <td>{open ? formatDateTime(g.proposalDeadline) : g.subStatus === 'proposal_collection' && !g.proposalDeadline ? '마감일 미정' : '접수 마감'}</td>
                  <td className={s.right}>{submitted ? '제출함' : mine?.status === 'withdrawn' ? '철회함' : '-'}</td>
                  <td className={s.action}>
                    {submitted
                      ? <Button href="/firm/proposals" variant="chip" size="sm">제출함</Button>
                      : open
                        ? <Button href={routes.firmGroupProposal(g.id)} size="sm">{mine ? '다시 제출' : '제안서 작성'}</Button>
                        : <Button href={routes.firmGroupView(g.id)} variant="chip" size="sm">그룹 보기</Button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {votingCount > 0 && (
        <p className={s.note}>
          아직 대응 방법 투표 중인 그룹이 {votingCount}개 있습니다. 공동소송으로 정해지면 이 표에 나타나고 수임 제안서를 보낼 수 있습니다.
        </p>
      )}
      {rows && rows.some((r) => !r.stats) && <p className={s.note}>2차 피해 · 증거 보유율 집계는 승인된 로펌에게만 보입니다.</p>}

      <p className={s.lockNote}>
        <Icon name="lock-note" size={16} />
        공동소송으로 정해진 그룹에만 수임 제안서를 보낼 수 있습니다. 참여자의 실명 · 연락처는 선정된 로펌에, 연락처 공개에 동의한 분의 것만 전달됩니다. HANDE는 사건 소개나 수임에 따른 수수료를 받지 않습니다.
      </p>
    </>
  )
}
