'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from '../common/Icon'
import Logo from '../common/Logo'
import IntroHeader from './IntroHeader'
import FluidBackground from '../common/FluidBackground'
import SearchBox from '../common/SearchBox'
import { currentUser } from '@/lib/mock'
import { MY_GROUPS } from '@/features/groups/data'
import { groupActions } from '@/features/groups/store'
import { userActions, useUserState } from '@/features/user/store'
import s from './UserShell.module.css'
import { routes } from '@/lib/routes'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/home', label: '홈', icon: 'nav-home', end: true },
  { to: '/report', label: '피해 등록', icon: 'nav-edit' },
  { to: '/cases', label: '사건 둘러보기', icon: 'nav-search' },
  { to: '/groups', label: '내 그룹', icon: 'nav-users' },
]

function isNavActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

// 로그인 전에는 로그인 링크, 로그인 후에는 닉네임 · 로그아웃
function Account({ loggedIn }: { loggedIn: boolean }) {
  if (!loggedIn) return <Link href="/login" className={s.name}>로그인</Link>
  return (
    <>
      <span className={s.name}>{currentUser.nickname} 님</span>
      <Link href="/" className={s.logout} onClick={logout}>로그아웃</Link>
    </>
  )
}

const logout = () => {
  userActions.logout()
  groupActions.reset()
}

export default function UserShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { loggedIn, joined } = useUserState()
  const myGroups = loggedIn ? MY_GROUPS.filter((g) => joined.includes(g.id)) : []
  // 홈 · 로고: 로그인 전에는 HANDE 소개 홈(/), 로그인 후에는 내 홈(/home)
  const homeHref = loggedIn ? '/home' : '/'
  // 로그인 전에는 피해 등록 · 내 그룹 메뉴를 숨김
  const nav = NAV.filter((n) => loggedIn || (n.to !== '/report' && n.to !== '/groups'))
    .map((n) => (n.to === '/home' ? { ...n, to: homeHref } : n))
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Esc로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // 로그인 전에는 소개 홈과 똑같은 상단 헤더를 그대로 사용
  if (!loggedIn) {
    return (
      <div className={s.guest}>
        <FluidBackground />
        <IntroHeader />
        <main className={s.guestMain}>{children}</main>
      </div>
    )
  }

  return (
    <div className={`${s.shell} ${open ? s.open : ''}`}>
      <FluidBackground />
      <aside className={s.sidebar} id="sidebar" aria-label="메뉴" onClick={(e) => (e.target as HTMLElement).closest('a') && close()}>
        <div className={s.sideTop}>
          <Logo href={homeHref} />
          <button className={s.close} onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <Icon name="x" size={24} />
          </button>
        </div>
        <nav className={s.nav}>
          {nav.map((n) => (
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
              <Link key={g.id} href={routes.groupView(g.id)} className={s.mineItem}>{g.title}</Link>
            ))}
          </div>
        )}
        <div className={s.spacer} />
        <div className={s.me}><Account loggedIn={loggedIn} /></div>
      </aside>
      <div className={s.backdrop} onClick={() => setOpen(false)} />

      <div className={s.main}>
        <header className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setOpen(true)} aria-label="메뉴 열기" aria-controls="sidebar" aria-expanded={open}>
            <Icon name="menu" size={24} />
          </button>
          <div className={s.topLogo}><Logo href={homeHref} /></div>
          <nav className={s.topNav} aria-label="주요 메뉴">
            {nav.map((n) => (
              <Link key={n.to} href={n.to} className={isNavActive(pathname, n.to, n.end) ? s.topActive : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div className={s.topSpacer} />
          <div className={s.topRight}>
            <SearchBox className={s.search} />
            <div className={s.topAuth}><Account loggedIn={loggedIn} /></div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
