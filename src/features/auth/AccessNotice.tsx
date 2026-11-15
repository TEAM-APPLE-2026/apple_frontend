import type { ReactNode } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import s from './AuthPage.module.css'

type Action = { href: string; label: string }

// I-11 · I-12 접근 안내 (다른 역할 전용 화면에 들어왔을 때)
export default function AccessNotice({ title, children, back, primary }: {
  title: string; children: ReactNode; back: Action; primary: Action
}) {
  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.mark}>
        <Icon name="lock" size={26} />
      </div>
      <h1 className={s.title}>{title}</h1>
      <p className={s.sub}>{children}</p>
      <div className={s.actions}>
        <Button href={back.href} variant="chip">{back.label}</Button>
        <Button href={primary.href}>{primary.label}</Button>
      </div>
    </div>
  )
}
