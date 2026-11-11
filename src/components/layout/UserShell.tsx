'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '../common/Icon'
import Logo from '../common/Logo'
import SearchBox from '../common/SearchBox'
import { currentUser, myGroups } from '@/lib/mock'
import s from './UserShell.module.css'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: '홈', icon: 'nav-home', end: true },
  { to: '/report', label: '피해 등록', icon: 'nav-edit' },
  { to: '/cases', label: '사건 둘러보기', icon: 'nav-search' },
  { to: '/groups', label: '내 그룹', icon: 'nav-users' },
]

function isNavActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function Account() {
  return (
    <>
      <span className={s.name}>{currentUser.nickname} 님</span>
      <button className={s.logout}>로그아웃</button>
    </>
  )
}

export default function UserShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Esc로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`${s.shell} ${open ? s.open : ''}`}>
      <aside className={s.sidebar} id="sidebar" aria-label="메뉴" onClick={(e) => (e.target as HTMLElement).closest('a') && close()}>
        <div className={s.sideTop}>
          <Logo />
          <button className={s.close} onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <Icon name="x" size={24} />
          </button>
        </div>
        <nav className={s.nav}>
          {NAV.map((n) => (
            <Link key={n.to} href={n.to} className={`${s.navItem} ${isNavActive(pathname, n.to, n.end) ? s.active : ''}`}>
              <Icon name={n.icon} size={18} />
              {n.label}
            </Link>
          ))}
        </nav>
        {myGroups.length > 0 && (
          <div className={s.mine}>
            <p className={s.mineTitle}>참여 중인 그룹</p>
            {myGroups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className={s.mineItem}>{g.title}</Link>
            ))}
          </div>
        )}
        <div className={s.spacer} />
        <div className={s.me}><Account /></div>
      </aside>
      <div className={s.backdrop} onClick={() => setOpen(false)} />

      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setOpen(true)} aria-label="메뉴 열기" aria-controls="sidebar" aria-expanded={open}>
            <Icon name="menu" size={24} />
          </button>
          <SearchBox />
          <div className={s.topSpacer} />
          <div className={s.topAuth}><Account /></div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
