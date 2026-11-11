import Link from 'next/link'
import s from './Logo.module.css'

export default function Logo() {
  return (
    <Link href="/" className={s.logo} aria-label="HANDE 홈">
      HANDE<span className={s.dot}>.</span>
    </Link>
  )
}
