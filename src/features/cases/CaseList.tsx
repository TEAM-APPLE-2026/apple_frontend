'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import p from '@/components/layout/Page.module.css'
import { CASES, HARMS, STATUS, type CaseStatus } from './data'
import s from './CaseList.module.css'

const SORTS = { members: '참여 많은 순', recent: '최근 개설 순', deadline: '마감 임박 순' } as const
type SortKey = keyof typeof SORTS
const STATUS_KEYS = Object.keys(STATUS) as CaseStatus[]
// 마감 임박 순: 날짜가 있는 사건 먼저, "정하는 중" · "마감" 은 뒤로
const deadlineKey = (d: string) => (/^\d/.test(d) ? d : d === '정하는 중' ? '8' : '9')

// U-13 사건 둘러보기 · U-14 검색 결과 없음 · U-15 필터 결과 없음
export default function CaseList() {
  const router = useRouter()
  const q = (useSearchParams().get('q') ?? '').trim()
  const [status, setStatus] = useState<CaseStatus | ''>('')
  const [harm, setHarm] = useState('')
  const [sort, setSort] = useState<SortKey>('members')

  const rows = useMemo(() => {
    const list = CASES.filter((c) => (!q || c.title.includes(q)) && (!status || c.status === status) && (!harm || c.harm === harm))
    return list.sort((a, b) =>
      sort === 'members' ? b.count - a.count
        : sort === 'recent' ? b.created.localeCompare(a.created)
          : deadlineKey(a.deadline).localeCompare(deadlineKey(b.deadline)),
    )
  }, [q, status, harm, sort])

  const filtered = Boolean(status || harm)
  const countNote = q ? `"${q}" 검색 결과 ${rows.length}건` : filtered ? `검색 결과 ${rows.length}건` : `전체 ${rows.length}건`
  const resetFilters = () => {
    setStatus('')
    setHarm('')
    if (q) router.replace('/cases')
  }

  return (
    <>
      <div className={s.filters}>
        <label className={p.filter}>
          상태
          <select className={p.select} value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | '')}>
            <option value="">전체</option>
            {STATUS_KEYS.map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}
          </select>
        </label>
        <label className={p.filter}>
          피해 유형
          <select className={p.select} value={harm} onChange={(e) => setHarm(e.target.value)}>
            <option value="">전체</option>
            {HARMS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className={p.filter}>
          정렬
          <select className={p.select} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
        <p className={s.cnt} aria-live="polite">{countNote}</p>
      </div>

      {rows.length === 0 ? (
        <div className={p.emptyBox}>
          {/* 검색만 했을 때(U-14)와 필터를 걸었을 때(U-15) 안내가 다름 */}
          <p className={p.emptyTitle}>{filtered ? '조건에 맞는 사건이 없어요' : '아직 이 사건으로 모인 그룹이 없어요'}</p>
          <p className={p.emptyDesc}>{filtered ? '필터를 바꾸거나, 겪은 일을 적어 새 그룹을 열 수 있어요.' : '겪은 일을 적으면 새 그룹을 열 수 있어요.'}</p>
          <div className={s.emptyRow}>
            {filtered && <Button variant="chip" size="sm" onClick={resetFilters}>필터 초기화</Button>}
            <Button href="/report" size="sm">내 피해 등록하고 새 그룹 만들기</Button>
          </div>
        </div>
      ) : (
        <div className={`${p.tblWrap} ${s.wrap}`}>
          <table className={`${p.tbl} ${s.tbl}`}>
            <thead>
              <tr>
                <th scope="col">사건명</th>
                <th scope="col" className={s.cHarm}>피해 유형</th>
                <th scope="col" className={s.cStatus}>상태</th>
                <th scope="col" className={s.cCount}>참여 / 목표</th>
                <th scope="col" className={s.cDate}>모집 마감</th>
                <th scope="col" className={s.cDate}>개설일</th>
                <th scope="col"><span className="sr-only">보기</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <th scope="row" className={s.name}><Link href={`/cases/${c.id}`}>{c.title}</Link></th>
                  <td className={s.harm}>{c.harm}</td>
                  <td><Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge></td>
                  <td className={s.count}>
                    <span className="num">{c.count.toLocaleString()}</span>
                    {c.goal && <> <span className="num">/</span> <span className="num">{c.goal.toLocaleString()}</span></>}명{' '}
                    <small>[예시 수치]</small>
                  </td>
                  <td className={s.date}>{c.deadline}</td>
                  <td className={s.date}>{c.created}</td>
                  <td className={p.action}><Button href={`/cases/${c.id}`} variant="chip" size="sm">보기</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
