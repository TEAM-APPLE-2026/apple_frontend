'use client'

import { useEffect, useState } from 'react'
import Icon from '@/components/common/Icon'
import s from './Hero.module.css'

const FIRST = '한곳으로 모아줍니다'
const WORD = 'HANDE'
const RING = 'SCROLL DOWN • SCROLL DOWN • '

// Figma hero: SAME HARM, ONE VOICE · 타자기 "한곳으로 모아줍니다" → 지우고 → "HANDE" · 리드 · scroll-down 버튼
export default function Hero() {
  const [text, setText] = useState('')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = window.setTimeout(() => setText(WORD), 0)
      return () => window.clearTimeout(id)
    }
    let timer = 0
    const wait = (fn: () => void, ms: number) => { timer = window.setTimeout(fn, ms) }
    const typeWord = (i: number) => {
      setText(WORD.slice(0, i))
      if (i < WORD.length) wait(() => typeWord(i + 1), 140)
    }
    const erase = (i: number) => {
      setText(FIRST.slice(0, i))
      if (i > 0) wait(() => erase(i - 1), 60)
      else wait(() => typeWord(1), 300)
    }
    const typeFirst = (i: number) => {
      setText(FIRST.slice(0, i))
      if (i < FIRST.length) wait(() => typeFirst(i + 1), 120)
      else wait(() => erase(FIRST.length - 1), 1200)
    }
    wait(() => typeFirst(1), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const scrollDown = () => document.getElementById('organize')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <p className={`num ${s.kicker}`}>SAME HARM, ONE VOICE</p>
      <h1 id="hero-title" className={`num ${s.title}`} aria-label={`${WORD}, 흩어진 피해를 ${FIRST}`}>
        <span aria-hidden>{text}</span>
        <span className={s.cursor} aria-hidden />
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
