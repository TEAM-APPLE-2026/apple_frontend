'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { FIRM_GROUPS, HARM_TYPES, VOTING_GROUP_ID, findGroup, formatDeadline } from './data'
import { firmActions, useFirmState } from './store'
import s from '@/components/layout/Page.module.css'
import { routes } from '@/lib/routes'

const SORTS = { deadline: '제안 마감 빠른 순', members: '참여 많은 순', share: '득표 높은 순' } as const
type SortKey = keyof typeof SORTS

// F-01 사건 탐색 · F-02 공동소송 그룹 추가됨 · F-03 제안서 제출 후
export default function GroupExplorer() {
  const { lawsuitGroups, proposals } = useFirmState()
  const [harm, setHarm] = useState('')
  const [sort, setSort] = useState<SortKey>('deadline')

  const rows = useMemo(() => {
    const list = FIRM_GROUPS.filter((g) => lawsuitGroups.includes(g.id) && (!harm || g.harm === harm))
    return [...list].sort((a, b) =>
      sort === 'members' ? b.members - a.members : sort === 'share' ? b.share - a.share : a.deadline.localeCompare(b.deadline),
    )
  }, [lawsuitGroups, harm, sort])

  const votingGroup = lawsuitGroups.includes(VOTING_GROUP_ID) ? null : findGroup(VOTING_GROUP_ID)
  const submitted = (id: string) => proposals.some((p) => p.groupId === id)

  return (
    <>
      <div className={s.filters}>
        <label className={s.filter}>
          피해 유형
          <select className={s.select} value={harm} onChange={(e) => setHarm(e.target.value)}>
            <option value="">전체</option>
            {HARM_TYPES.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className={s.filter}>
          정렬
          <select className={s.select} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th scope="col">그룹</th>
              <th scope="col" style={{ width: 116 }}>피해 유형</th>
              <th scope="col" className={s.right} style={{ width: 86 }}>참여</th>
              <th scope="col" className={s.right} style={{ width: 86 }}>2차 피해</th>
              <th scope="col" style={{ width: 120 }}>공동소송 득표</th>
              <th scope="col" style={{ width: 120 }}>제안 마감</th>
              <th scope="col" className={s.right} style={{ width: 96 }}>제출된 제안</th>
              <th scope="col"><span className="sr-only">작업</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className={s.note}>조건에 맞는 그룹이 없습니다.</td></tr>
            )}
            {rows.map((g) => {
              const mine = submitted(g.id)
              return (
                <tr key={g.id}>
                  <th scope="row" className={s.groupName}><Link href={routes.firmGroupView(g.id)}>{g.title}</Link></th>
                  <td>{g.harm}</td>
                  <td className={s.right}>{g.members.toLocaleString()}명</td>
                  <td className={s.right}>{g.secondary.toLocaleString()}명</td>
                  <td>
                    <span className={s.share}>
                      <span className={s.shareBar} aria-hidden><span className={s.shareFill} style={{ width: `${g.share}%` }} /></span>
                      {g.share}%
                    </span>
                  </td>
                  <td>{formatDeadline(g.deadline)}</td>
                  <td className={s.right}>{g.proposals + (mine ? 1 : 0)}건</td>
                  <td className={s.action}>
                    {mine
                      ? <Button href="/firm/proposals" variant="chip" size="sm">제출함</Button>
                      : <Button href={routes.firmGroupProposal(g.id)} size="sm">제안서 작성</Button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {votingGroup && (
        <p className={s.note}>
          {votingGroup.title} 그룹은 아직 대응 방법 투표 중입니다. 공동소송으로 정해지면 이 표에 나타나고 수임 제안서를 보낼 수 있습니다.
          <button className={s.demoBtn} onClick={firmActions.closeVote}>[시연] 투표 마감하기</button>
        </p>
      )}

      <p className={s.lockNote}>
        <Icon name="lock-note" size={16} />
        공동소송으로 정해진 그룹에만 수임 제안서를 보낼 수 있습니다. 참여자의 실명 · 연락처는 선정된 로펌에, 연락처 공개에 동의한 분의 것만 전달됩니다. HANDE는 사건 소개나 수임에 따른 수수료를 받지 않습니다.
      </p>
    </>
  )
}
