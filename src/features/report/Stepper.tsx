import s from './Stepper.module.css'

const STEPS = ['글로 적기', '정리 확인', '그룹 찾기', '참여']

// Figma 🧩 Stepper (1 ~ 4): 지난 단계 neon · 현재 blue · 남은 단계 회색
export default function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol className={s.stepper} aria-label={`4단계 중 ${step}단계`}>
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n < step ? s.done : n === step ? s.now : ''
        return (
          <li key={label} className={`${s.step} ${state}`} aria-current={n === step ? 'step' : undefined}>
            <span className="num">{n}</span> {label}
          </li>
        )
      })}
    </ol>
  )
}
