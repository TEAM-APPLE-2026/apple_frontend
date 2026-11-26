'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/common/Badge'
import Icon from '@/components/common/Icon'
import { Num, SectionHead } from './Sections'
import { CASES, type CaseCard } from './data'
import s from './CasesSection.module.css'
import { routes } from '@/lib/routes'

// 점 1개 = 1명 · 500명이 넘으면 점 1개 = 5명 · 빈 점은 목표까지 남은 인원
export function dotCounts({ count, goal }: { count: number; goal?: number }) {
  const unit = Math.max(count, goal ?? 0) > 500 ? 5 : 1
  const filled = Math.ceil(count / unit)
  const empty = goal ? Math.max(Math.ceil(goal / unit) - filled, 0) : 0
  return { filled, empty }
}

function Card({ c }: { c: CaseCard }) {
  const { filled, empty } = dotCounts(c)
  return (
    <article className={s.card} aria-labelledby={`case-${c.id}`}>
      <div className={s.top}>
        <span className={s.category}>{c.category}</span>
        <Badge tone={c.badge.tone}>{c.badge.label}</Badge>
      </div>
      <h3 id={`case-${c.id}`} className={s.title}>{c.title}</h3>
      <div className={s.cnt}>
        <p className={s.count}>
          <span className={`num ${s.countNum}`}>{c.count}</span>명
          {c.goal && <> <span className="num">/</span> 목표 <span className="num">{c.goal}</span>명</>}
        </p>
        <p className={s.note}>{c.note}</p>
      </div>
      <div className={s.dots} role="img" aria-label={c.goal ? `목표 ${c.goal}명 중 ${c.count}명 참여` : `${c.count}명 참여`}>
        {Array.from({ length: filled }, (_, i) => <span key={`f${i}`} className={s.dot} />)}
        {Array.from({ length: empty }, (_, i) => <span key={`e${i}`} className={s.dotEmpty} />)}
      </div>
      <p className={s.status}>{c.status}</p>
      <Link href={routes.caseView(c.id)} className={s.go}>
        그룹 보기
        <Icon name="card-arrow" size={16} />
      </Link>
    </article>
  )
}

// cases · 사건: 가로 캐러셀 (데스크톱 3장 보임)
export default function CasesSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth
    setIndex(Math.round(el.scrollLeft / step))
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const move = (dir: 1 | -1) => {
    const el = trackRef.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0')
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section id="cases" className={s.section} aria-labelledby="cases-h">
      <SectionHead
        eyebrow={<>사건 <Num>/05</Num></>}
        strong={<span id="cases-h">지금 모이고 있는</span>}
        light="사건"
        lead="같은 피해를 입은 사람들이 모이고 있어요. 내 일과 같은 사건이 있다면 함께해요."
      />
      <div className={s.ccTop}>
        <p className={s.key}>
          점 1개 = 1명 · 500명이 넘으면 점 1개 = 5명 · 빈 점은 목표까지 남은 인원 <span className={s.keyTag}>[예시 수치]</span>
        </p>
        <div className={s.ctrl}>
          <button className={s.arrowBtn} onClick={() => move(-1)} disabled={index === 0} aria-label="이전 사건">
            <Icon name="arrow-left" size={18} />
          </button>
          <p className={`num ${s.now}`} aria-live="polite">
            <b>{index + 1}</b> / {CASES.length}
          </p>
          <button className={s.arrowBtn} onClick={() => move(1)} disabled={atEnd} aria-label="다음 사건">
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
      <div ref={trackRef} className={s.track} tabIndex={0} aria-label="사건 목록">
        {CASES.map((c) => <Card key={c.id} c={c} />)}
      </div>
      <Link href="/cases" className={s.more}>
        전체 사건 보기
        <Icon name="more-arrow" size={18} />
      </Link>
    </section>
  )
}
