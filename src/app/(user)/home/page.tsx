'use client'
import Link from 'next/link'
import {useSession} from '@/features/auth/SessionProvider'
import s from './page.module.css'

// U-01 홈 (로그인 후)
const QUICK = [
  { to: '/groups', label: '내 그룹', desc: '참여 중인 그룹과 할 일' },
  { to: '/report', label: '피해 등록하기', desc: '글로 적으면 AI가 정리해요' },
  { to: '/cases', label: '사건 둘러보기', desc: '지금 모이고 있는 사건' },
]

export default function HomePage() {
  const {profile,loading}=useSession()
  if(loading)return <p>로그인 상태를 확인하고 있어요.</p>
  if(!profile)return <p>로그인 후 이용해 주세요. <Link href="/login">로그인</Link></p>
  return (
    <div className={s.page}>
      <h1 className={s.title}>{profile.profile.nickname} 님, 안녕하세요</h1>
      <p className={s.lead}>겪은 일을 적으면 같은 피해를 입은 사람들의 그룹을 찾아 드려요.</p>
      <nav className={s.quick} aria-label="바로가기">
        {QUICK.map((q) => (
          <Link key={q.to} href={q.to} className={s.link}>
            <span className={s.label}>{q.label}</span>
            <span className={s.desc}>{q.desc}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
