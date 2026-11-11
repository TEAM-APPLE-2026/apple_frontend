import Link from 'next/link'
import { currentUser } from '@/lib/mock'
import s from './page.module.css'

// U-01 홈 (로그인 후)
const QUICK = [
  { to: '/groups', label: '내 그룹', desc: '참여 중인 그룹과 할 일' },
  { to: '/report', label: '피해 등록하기', desc: '글로 적으면 AI가 정리해요' },
  { to: '/cases', label: '사건 둘러보기', desc: '지금 모이고 있는 사건 [예시]' },
]

export default function HomePage() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>{currentUser.nickname} 님, 안녕하세요</h1>
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
