import Link from 'next/link'
import BackLink from '@/components/common/BackLink'
import FirmLoginForm from '@/features/auth/FirmLoginForm'
import s from '@/features/auth/AuthPage.module.css'

// I-07 로펌 로그인 · I-08 사업자 확인됨 · I-09 사업자 확인 필요 · I-10 실패
export default function FirmLoginPage() {
  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}><span className="num">/02</span> 로펌</p>
        <BackLink href="/start" label="다시 고르기" />
      </div>
      <h1 className={s.title}>로펌 로그인</h1>
      <p className={s.sub}>사업자 확인을 마친 로펌만 공동소송 그룹에 수임 제안서를 보낼 수 있습니다.</p>
      <FirmLoginForm />
      <p className={s.demo}>시연용입니다. 실제 국세청 조회는 하지 않습니다. 비밀번호에 wrong을 넣으면 로그인 실패 화면을 볼 수 있습니다.</p>
      <p className={s.alt}>일반 사용자이신가요? <Link href="/login">일반 사용자 로그인</Link></p>
    </div>
  )
}
