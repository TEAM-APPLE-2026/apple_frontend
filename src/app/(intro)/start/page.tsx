import Link from 'next/link'
import BackLink from '@/components/common/BackLink'
import Icon from '@/components/common/Icon'
import s from '@/features/auth/AuthPage.module.css'

const ROLES = [
  { href: '/login', num: '/01', name: '일반 사용자로 시작하기', desc: '피해를 등록하고 같은 피해자 그룹에 참여해요', main: true },
  { href: '/login/firm', num: '/02', name: '로펌으로 시작하기', desc: '사업자 확인 후 공동소송 그룹에 수임 제안서를 보내요', main: false },
]

const PROMISES = [
  '법률 자문 · 수수료 없이 모으고 연결하는 데까지만 도와요',
  '다른 피해자에게는 닉네임 · 피해 정도 · 시기만 보여요',
  '비용 없는 방법을 먼저 안내해요',
]

// I-04 시작하기 (역할 고르기)
export default function StartPage() {
  return (
    <div className={`${s.page} ${s.wide}`}>
      <div className={s.bar}>
        <p className={s.barLabel}>시작하기</p>
        <BackLink href="/" />
      </div>
      <h1 className={s.title}>어떻게 시작할까요?</h1>
      <p className={s.sub}>시연용 화면이에요. 실제 개인정보는 입력하지 마세요.</p>

      <ul className={s.roles}>
        {ROLES.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className={s.role}>
              <span className={s.roleText}>
                <span className={`num ${s.roleNum}`}>{r.num}</span>
                <span className={s.roleName}>{r.name}</span>
                <span className={s.roleDesc}>{r.desc}</span>
              </span>
              <span className={`${s.go} ${r.main ? s.goMain : ''}`}>
                <Icon name="role-arrow" size={22} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={s.promise}>
        {PROMISES.map((p) => (
          <p key={p}><span className={s.dash}>— </span>{p}</p>
        ))}
      </div>
    </div>
  )
}
