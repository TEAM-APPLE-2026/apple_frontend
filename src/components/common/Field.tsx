import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import s from './Field.module.css'

// Figma 🧩 Field — type: Input | (짧은 입력칸) Textarea, state: Default | Error
type Common = { label?: string; error?: boolean; className?: string }
type InputProps = Common & { multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>
type AreaProps = Common & { multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export default function Field(props: InputProps | AreaProps) {
  const autoId = useId()
  const { label, error, className, id, multiline, ...control } = props
  const inputId = id ?? autoId
  const cls = `${s.box} ${multiline ? s.area : ''} ${error ? s.error : ''}`
  return (
    <div className={`${s.field} ${className ?? ''}`}>
      {label && <label htmlFor={inputId} className={s.label}>{label}</label>}
      {multiline
        ? <textarea id={inputId} className={cls} aria-invalid={error || undefined} {...(control as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        : <input id={inputId} className={cls} aria-invalid={error || undefined} {...(control as InputHTMLAttributes<HTMLInputElement>)} />}
    </div>
  )
}
