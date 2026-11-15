'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import Icon from './Icon'
import s from './Modal.module.css'

// Figma modal (overlay + modal-box). Esc · 바깥 클릭 · X로 닫힘
export default function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId()
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    boxRef.current?.querySelector<HTMLElement>('a, button:not([aria-label="닫기"])')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
  }, [onClose])

  return (
    <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} className={s.box} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className={s.x} onClick={onClose} aria-label="닫기"><Icon name="modal-x" size={22} /></button>
        <h2 id={titleId} className={s.title}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
