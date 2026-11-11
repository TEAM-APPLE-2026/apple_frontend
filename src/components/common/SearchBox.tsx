'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import s from './SearchBox.module.css'

// Figma SearchBox — 제출하면 사건 둘러보기로 이동
export default function SearchBox({ className }: { className?: string }) {
  const [q, setQ] = useState('')
  const router = useRouter()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    router.push(`/cases${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }
  return (
    <form role="search" className={`${s.box} ${className ?? ''}`} onSubmit={submit}>
      <Icon name="searchbox-search" size={16} />
      <input className={s.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="기업 · 사건 이름으로 찾기" aria-label="기업 · 사건 이름으로 찾기" />
    </form>
  )
}
