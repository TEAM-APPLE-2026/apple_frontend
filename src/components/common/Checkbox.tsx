import type { InputHTMLAttributes } from 'react'
import Icon from './Icon'
import s from './Checkbox.module.css'

// Figma 🧩 Checkbox — checked: false | true
export default function Checkbox({ label, ...input }: { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={s.row}>
      <input type="checkbox" className={s.input} {...input} />
      <span className={s.box} aria-hidden><Icon name="checkbox-check" size={16} className={s.check} /></span>
      {label}
    </label>
  )
}
