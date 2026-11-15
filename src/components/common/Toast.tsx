'use client'

import { useEffect } from 'react'
import s from './Toast.module.css'

// Figma 🧩 Toast — 3초 뒤 자동으로 닫힘
export default function Toast({ message, onDone, className }: { message: string | null; onDone: () => void; className?: string }) {
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(onDone, 3000)
    return () => window.clearTimeout(id)
  }, [message, onDone])

  return (
    <div className={`${s.region} ${className ?? ''}`} role="status" aria-live="polite">
      {message && <p className={s.toast}>{message}</p>}
    </div>
  )
}
