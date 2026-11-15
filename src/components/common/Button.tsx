import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Icon from './Icon'
import s from './Button.module.css'

// Figma 🧩 Button — style: Primary | Chip, size: SM | MD
type Props = {
  variant?: 'primary' | 'chip'
  size?: 'sm' | 'md'
  block?: boolean
  check?: boolean
  arrow?: boolean
  /** 주면 링크(<a>)로, 없으면 <button>으로 렌더링 */
  href?: string
  className?: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export default function Button({
  variant = 'primary', size = 'md', block, check, arrow, href, className, children, type = 'button', ...rest
}: Props) {
  const cls = [s.btn, s[variant], s[size], block ? s.block : '', className ?? ''].join(' ')
  const content = (
    <>
      {check && <Icon name="btn-check" size={18} />}
      <span>{children}</span>
      {arrow && <Icon name="btn-arrow" size={18} />}
    </>
  )
  if (href !== undefined) return <Link href={href} className={cls}>{content}</Link>
  return <button type={type} className={cls} {...rest}>{content}</button>
}
