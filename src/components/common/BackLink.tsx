import Link from 'next/link'
import Icon from './Icon'
import s from './BackLink.module.css'

// Figma 🧩 BackLink
export default function BackLink({ href, label = '처음으로' }: { href: string; label?: string }) {
  return (
    <Link href={href} className={s.back}>
      <Icon name="back-arrow" size={16} />
      {label}
    </Link>
  )
}
