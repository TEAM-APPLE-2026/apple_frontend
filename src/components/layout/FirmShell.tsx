'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '../common/Icon'
import Logo from '../common/Logo'
import Toast from '../common/Toast'
import { FIRM } from '@/features/firm/data'
import { firmActions, useFirmState } from '@/features/firm/store'
import s from './UserShell.module.css'
import f from './FirmShell.module.css'

// Figma Sidebar/Firm · Topbar/Firm — 레이아웃 동작(드로어 등)은 UserShell과 같음
const NAV: { to: string; label: string; icon: IconName; iconOn: IconName; end?: boolean }[] = [
  { to: '/firm', label: '사건 탐색', icon: 'fnav-search', iconOn: 'fnav-search-on' },
  { to: '/firm/proposals', label: '내 제안서', icon: 'fnav-file', iconOn: 'fnav-file-on' },
  { to: '/firm/cases', label: '담당 사건', icon: 'fnav-scale', iconOn: 'fnav-scale-on' },
  { to: '/firm/profile', label: '로펌 정보', icon: 'fnav-building', iconOn: 'fnav-building-on' },
]

// 사건 탐색은 그룹 보기 · 제안서 작성 화면에서도 활성
function isActive(pathname: string, to: string) {
  if (to === '/firm') return pathname === '/firm' || pathname.startsWith('/firm/groups')
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function FirmTag() {
  return (
    <span className={f.tag}>
      <Icon name="firm-scale" size={14} />
      로펌 전용
    </span>
  )
}

function Account({ loggedIn }: { loggedIn: boolean }) {
  if (!loggedIn) return <Link href="/login/firm" className={s.name}>로펌 로그인</Link>
  return (
    <>
      <span className={s.name}>{FIRM.name}</span>
      <Link href="/" className={s.logout} onClick={firmActions.reset}>로그아웃</Link>
    </>
  )
}

export default function FirmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { toast, loggedIn } = useFirmState()
  const [open, setOpen] = useState(false)
  const clearToast = useCallback(() => firmActions.clearToast(), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`${s.shell} ${f.shell} ${open ? s.open : ''}`}>
      <aside className={`${s.sidebar} ${f.sidebar}`} id="sidebar" aria-label="메뉴" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
        <div className={s.sideTop}>
          <Logo href="/firm" />
          <button className={s.close} onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <Icon name="x" size={24} />
          </button>
        </div>
        <div className={f.tagWrap}><FirmTag /></div>
        <nav className={s.nav}>
          {NAV.map((n) => {
            const active = isActive(pathname, n.to)
            return (
              <Link key={n.to} href={n.to} className={`${s.navItem} ${active ? s.active : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon name={active ? n.iconOn : n.icon} size={18} />
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div className={s.spacer} />
        <div className={s.me}><Account loggedIn={loggedIn} /></div>
      </aside>
      <div className={s.backdrop} onClick={() => setOpen(false)} />

      <div className={s.main}>
        <header className={`${s.topbar} ${f.topbar}`}>
          <button className={s.menuBtn} onClick={() => setOpen(true)} aria-label="메뉴 열기" aria-controls="sidebar" aria-expanded={open}>
            <Icon name="menu" size={24} />
          </button>
          <FirmTag />
          <div className={s.topSpacer} />
          <div className={s.topAuth}><Account loggedIn={loggedIn} /></div>
        </header>
        <main>{children}</main>
      </div>
      <Toast message={toast} onDone={clearToast} className={f.toast} />
    </div>
  )
}
