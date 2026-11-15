'use client'

import { useState } from 'react'
import Icon from '@/components/common/Icon'
import { Num, SectionHead } from './Sections'
import { FAQS } from './data'
import s from './FaqSection.module.css'

// faq · 자주 묻는 질문 — 접힘(I-01) / 펼침(I-02). 여러 개를 동시에 펼칠 수 있음.
export default function FaqSection() {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section id="faq" className={s.section} aria-labelledby="faq-h">
      <SectionHead eyebrow={<Num>FAQ</Num>} strong={<span id="faq-h">자주 묻는</span>} light="질문" />
      <ul className={s.list}>
        {FAQS.map((f, i) => {
          const isOpen = open.has(i)
          return (
            <li key={f.q} className={`${s.item} ${isOpen ? s.open : ''}`}>
              <h3 className={s.qWrap}>
                <button className={s.q} onClick={() => toggle(i)} aria-expanded={isOpen} aria-controls={`faq-a-${i}`}>
                  <span className={s.qText}>{f.q}</span>
                  <Icon name={isOpen ? 'faq-x' : 'plus'} size={20} />
                </button>
              </h3>
              <p id={`faq-a-${i}`} className={s.a} hidden={!isOpen}>{f.a}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
