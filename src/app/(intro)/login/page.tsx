import Link from 'next/link'
import BackLink from '@/components/common/BackLink'
import UserLoginForm from '@/features/auth/UserLoginForm'
import s from '@/features/auth/AuthPage.module.css'

// I-05 일반 사용자 로그인 · I-06 실패
export default function UserLoginPage() {
  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}><span className="num">/01</span> 일반 사용자</p>
        <BackLink href="/start" label="다시 고르기" />
      </div>
      <h1 className={s.title}>일반 사용자 로그인</h1>
      <p className={s.sub}>로그인하면 내 그룹 현황을 보고 그룹에 참여할 수 있어요.</p>
      <UserLoginForm />
      <p className={s.alt}><Link href="/signup">계정·프로필 등록</Link></p>
      <p className={s.alt}>로펌이신가요? <Link href="/login/firm">로펌 로그인</Link></p>
    </div>
  )
}
