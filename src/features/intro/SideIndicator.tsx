'use client'

import { useEffect, useState } from 'react'
import { SECTIONS } from './data'
import s from './SideIndicator.module.css'

// side-indicator: 화면 가운데를 지나는 섹션 번호 (01 / 05)
export default function SideIndicator() {
  const [num, setNum] = useState<string>(SECTIONS[0].num)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const hit = SECTIONS.find((sec) => sec.id === e.target.id)
          if (hit) setNum(hit.num)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <div className={`num ${s.indicator}`} aria-hidden>
      <span className={s.now}>{num}</span>
      <span className={s.total}>/ 05</span>
    </div>
  )
}
