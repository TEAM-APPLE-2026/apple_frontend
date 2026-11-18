'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { dotCounts } from '@/features/intro/CasesSection'
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
        <label className={s.filter}>
          상태
          <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | '')}>
            <option value="">전체</option>
            {STATUS_KEYS.map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}
          </select>
        </label>
        <label className={s.filter}>
          피해 유형
          <select className={s.select} value={harm} onChange={(e) => setHarm(e.target.value)}>
            <option value="">전체</option>
            {HARMS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className={s.filter}>
          정렬
          <select className={s.select} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
        <p className={s.cnt} aria-live="polite">{countNote}</p>
      </div>

      {rows.length === 0 ? (
        <div className={s.empty}>
          {/* 검색만 했을 때(U-14)와 필터를 걸었을 때(U-15) 안내가 다름 */}
          <p className={s.emptyTitle}>{filtered ? '조건에 맞는 사건이 없어요' : '아직 이 사건으로 모인 그룹이 없어요'}</p>
          <p className={s.emptyDesc}>{filtered ? '필터를 바꾸거나, 겪은 일을 적어 새 그룹을 열 수 있어요.' : '겪은 일을 적으면 새 그룹을 열 수 있어요.'}</p>
          <div className={s.emptyRow}>
            {filtered && <Button variant="chip" size="sm" onClick={resetFilters}>필터 초기화</Button>}
            <Button href="/report" size="sm">내 피해 등록하고 새 그룹 만들기</Button>
          </div>
        </div>
      ) : (
        <ul className={s.grid} aria-label="사건 목록">
          {rows.map((c) => {
            const { filled, empty } = dotCounts(c)
            return (
              <li key={c.id}>
                <article className={s.card} aria-labelledby={`case-${c.id}`}>
                  <div className={s.top}>
                    <span className={s.category}>{c.harm}</span>
                    <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
                  </div>
                  <h2 id={`case-${c.id}`} className={s.title}><Link href={`/cases/${c.id}`}>{c.title}</Link></h2>
                  <div className={s.cntBox}>
                    <p className={s.count}>
                      <span className={`num ${s.countNum}`}>{c.count.toLocaleString()}</span>명
                      {c.goal && <> <span className="num">/</span> 목표 <span className="num">{c.goal.toLocaleString()}</span>명</>}
                    </p>
                    <p className={s.note}>[예시 수치]</p>
                  </div>
                  <div className={s.dots} role="img" aria-label={c.goal ? `목표 ${c.goal}명 중 ${c.count}명 참여` : `${c.count}명 참여`}>
                    {Array.from({ length: filled }, (_, i) => <span key={`f${i}`} className={s.dot} />)}
                    {Array.from({ length: empty }, (_, i) => <span key={`e${i}`} className={s.dotEmpty} />)}
                  </div>
                  <dl className={s.dates}>
                    <div><dt>모집 마감</dt><dd className="num">{c.deadline}</dd></div>
                    <div><dt>개설일</dt><dd className="num">{c.created}</dd></div>
                  </dl>
                  <Link href={`/cases/${c.id}`} className={s.go}>
                    보기
                    <Icon name="card-arrow" size={16} />
                  </Link>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
