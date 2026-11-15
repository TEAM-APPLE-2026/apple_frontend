'use client'

import { useEffect, useState } from 'react'
import Icon from '@/components/common/Icon'
import s from './Hero.module.css'

const WORD = 'HANDE'
const RING = 'SCROLL DOWN • SCROLL DOWN • '

// Figma hero: SAME HARM, ONE VOICE · 타자기 HANDE · 리드 · scroll-down 버튼
export default function Hero() {
  // 타자기 효과: 글자를 하나씩 보여줌. 숨긴 글자는 자리를 차지해 가운데 정렬이 흔들리지 않음.
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    if (typed >= WORD.length) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(() => setTyped(reduce ? WORD.length : typed + 1), reduce ? 0 : 140)
    return () => window.clearTimeout(id)
  }, [typed])

  const scrollDown = () => document.getElementById('organize')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <p className={`num ${s.kicker}`}>SAME HARM, ONE VOICE</p>
      <h1 id="hero-title" className={`num ${s.title}`} aria-label={WORD}>
        <span aria-hidden>{WORD.slice(0, typed)}</span>
        <span className={s.cursor} aria-hidden />
        <span aria-hidden className={s.rest}>{WORD.slice(typed)}</span>
      </h1>
      <p className={s.lead}>
        같은 피해를 입은 사람들을 AI가 <strong>한 그룹으로 모으고</strong>,<br />
        규모에 맞는 <strong>대응 방법</strong>을 함께 고르도록 도와요.
      </p>
      <button className={s.scroll} onClick={scrollDown} aria-label="아래로 스크롤">
        <svg className={`num ${s.ring}`} viewBox="0 0 100 100" width="100" height="100" aria-hidden>
          <defs>
            <path id="hero-ring" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
          </defs>
          <text textLength={2 * Math.PI * 40 - 4} lengthAdjust="spacing">
            <textPath href="#hero-ring" startOffset="0">{RING}</textPath>
          </text>
        </svg>
        <Icon name="arrow-down" size={18} className={s.arrow} />
      </button>
    </section>
  )
}
