import type { ReactNode } from 'react'
import s from './StateBox.module.css'

// Figma state-box: 진행 중 · 결과 없음 · 오류 안내
export default function StateBox({ icon, title, desc, error, children }: {
  icon: ReactNode; title: string; desc?: string; error?: boolean; children?: ReactNode
}) {
  return (
    <div className={`${s.box} ${error ? s.error : ''}`} role={error ? 'alert' : 'status'}>
      {icon}
      <p className={s.title}>{title}</p>
      {desc && <p className={s.desc}>{desc}</p>}
      {children && <div className={s.row}>{children}</div>}
    </div>
  )
}
