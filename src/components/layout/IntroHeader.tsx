'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { withBasePath } from '@/lib/basePath'
import Logo from '../common/Logo'
import Button from '../common/Button'
import Icon from '../common/Icon'
import s from './IntroHeader.module.css'

// 소개 페이지의 섹션 앵커. 다른 화면에서는 홈으로 이동한 뒤 해당 섹션으로 스크롤.
const NAV: { hash?: string; to?: string; label: string; num?: boolean }[] = [
  { hash: 'organize', label: '정리하기' },
  { hash: 'gather', label: '모으기' },
  { hash: 'decide', label: '대응하기' },
  { to: '/cases', label: '사건 둘러보기' },
  { hash: 'faq', label: 'FAQ', num: true },
]

// Figma IntroHeader (I-01 ~ I-12), 휴대폰 메뉴 열림 (I-03)
export default function IntroHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const anchor = (hash: string) => (pathname === '/' ? `#${hash}` : withBasePath(`/#${hash}`))

  // 경로가 바뀌면 메뉴 닫기 (렌더 중 상태 조정 패턴)
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  // 메뉴가 열려 있는 동안: Esc로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`${s.header} ${open ? s.open : ''}`}>
      <div className={s.bar}>
        <Logo />
        <div className={s.spacer} />
        <nav className={s.nav} aria-label="주요 메뉴">
          {NAV.map((n) => n.to
            ? <Link key={n.to} href={n.to}>{n.label}</Link>
            : <a key={n.hash} href={anchor(n.hash!)} className={n.num ? 'num' : undefined}>{n.label}</a>)}
        </nav>
        <div className={s.spacer} />
        <div className={s.right}>
          <Button href="/start" variant="chip" size="sm">시작하기</Button>
        </div>
        <button
          className={s.burger}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          aria-controls="intro-menu"
        >
          {open ? <Icon name="menu-x" size={22} /> : <Icon name="menu" size={24} />}
        </button>
      </div>

      <nav id="intro-menu" className={s.panel} aria-label="메뉴" hidden={!open}>
        {NAV.map((n) => n.to
          ? <Link key={n.to} href={n.to} className={s.panelLink} onClick={close}>{n.label}</Link>
          : <a key={n.hash} href={anchor(n.hash!)} className={`${s.panelLink} ${n.num ? 'num' : ''}`} onClick={close}>{n.label}</a>)}
        <Link href="/report" className={s.panelLink} onClick={close}>피해 등록하기</Link>
      </nav>
    </header>
  )
}
