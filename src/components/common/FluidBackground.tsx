'use client'

import { useEffect, useRef } from 'react'
import s from './FluidBackground.module.css'

type Blob = { x: number; y: number; vx: number; vy: number; r: number; a: number }

// 흐르는 파란 빛 배경 (소개 홈 시안의 fluid-canvas). 동작 줄이기 설정이면 정지 화면만 그림.
export default function FluidBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0
    const size = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    size()

    const blobs: Blob[] = Array.from({ length: 16 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.8, vy: (Math.random() - 0.5) * 1.8,
      r: Math.random() * 160 + 90, a: Math.random() * 0.35 + 0.15,
    }))
    const draw = (b: Blob) => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
      g.addColorStop(0, `rgba(26, 68, 255, ${b.a})`)
      g.addColorStop(0.6, `rgba(0, 140, 255, ${b.a * 0.4})`)
      g.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
    }
    const still = () => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); blobs.forEach(draw) }
    const frame = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; ctx.fillRect(0, 0, w, h)
      blobs.forEach((b) => {
        b.x += b.vx; b.y += b.vy
        if (b.x < -100 || b.x > w + 100) b.vx *= -1
        if (b.y < -100 || b.y > h + 100) b.vy *= -1
        draw(b)
      })
      raf = requestAnimationFrame(frame)
    }
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0
      if (!reduce && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const onResize = () => { size(); if (reduce) still() }

    still()
    sync()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return <canvas ref={ref} className={s.canvas} aria-hidden />
}
