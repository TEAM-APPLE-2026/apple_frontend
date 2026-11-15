'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import { firmActions, useFirmState, type Proposal } from './store'
import s from './FirmPage.module.css'
import p from './ProposalForm.module.css'

type Values = Omit<Proposal, 'groupId' | 'submittedAt' | 'status'>
type Key = keyof Values

const LABELS: Record<Key, string> = {
  fee: '착수금 (1인당)',
  successFee: '성공보수 (%)',
  period: '예상 기간',
  lawyers: '담당 변호사 수',
  leadLawyer: '담당 변호사 (대표)',
  strategy: '대응 전략',
}
// 칸 이름만 (메시지용)
const NAMES: Record<Key, string> = { fee: '착수금', successFee: '성공보수', period: '예상 기간', lawyers: '담당 변호사 수', leadLawyer: '담당 변호사', strategy: '대응 전략' }
const NUMERIC: Key[] = ['successFee', 'lawyers']

// 시연용 예시 값 (Figma F-05)
const EXAMPLE: Values = {
  fee: '1인 2만 원',
  successFee: '12',
  period: '6~10개월',
  lawyers: '3',
  leadLawyer: '[예시] 김OO 변호사',
  strategy: '유출 통지 지연과 2차 피해(스미싱)의 인과관계를 중심으로 손해배상을 청구합니다. 증거 보유율이 높아 공동소송으로 진행합니다.',
}

function validate(v: Values): { key: Key; msg: string } | null {
  for (const key of Object.keys(LABELS) as Key[]) {
    const value = v[key].trim()
    if (!value) return { key, msg: `${NAMES[key]} 칸을 채워 주세요.` }
    if (NUMERIC.includes(key) && !/^\d+(\.\d+)?$/.test(value)) return { key, msg: `${NAMES[key]} 칸을 확인해 주세요. 숫자만 입력합니다.` }
  }
  return null
}

// F-05 작성 → (F-06 입력 확인 필요) → F-07 제출 전 확인 → 제출 (F-09)
export default function ProposalForm({ groupId }: { groupId: string }) {
  const router = useRouter()
  const { proposals } = useFirmState()
  const existing = proposals.find((x) => x.groupId === groupId)
  const [values, setValues] = useState<Values>(() => {
    if (!existing) return EXAMPLE
    const { fee, successFee, period, lawyers, leadLawyer, strategy } = existing
    return { fee, successFee, period, lawyers, leadLawyer, strategy }
  })
  const [error, setError] = useState<{ key: Key; msg: string } | null>(null)
  const [step, setStep] = useState<'edit' | 'preview'>('edit')

  const change = (key: Key) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (error?.key === key) setError(null)
  }

  const preview = (e: FormEvent) => {
    e.preventDefault()
    const err = validate(values)
    setError(err)
    if (err) {
      document.getElementById(`pf-${err.key}`)?.focus()
      return
    }
    setStep('preview')
    window.scrollTo({ top: 0 })
  }

  const submit = () => {
    firmActions.submitProposal({ groupId, ...values })
    router.push('/firm/proposals')
  }

  if (step === 'preview') {
    const n = Number(values.lawyers)
    const rows: [string, string][] = [
      ['착수금', values.fee],
      ['성공보수', `${values.successFee}%`],
      ['예상 기간', values.period],
      ['담당 변호사', n > 1 ? `${values.leadLawyer} 외 · 총 ${n}명` : values.leadLawyer],
      ['대응 전략', values.strategy],
    ]
    return (
      <section className={p.preview} aria-labelledby="pf-preview">
        <h2 id="pf-preview" className={p.previewTitle}>제출 전 확인</h2>
        <dl className={`${s.dl} ${p.previewDl}`}>
          {rows.map(([dt, dd]) => (
            <div key={dt} className={s.dlRow}>
              <dt className={s.dt}>{dt}</dt>
              <dd className={`${s.dd} ${p.dd}`}>{dd}</dd>
            </div>
          ))}
        </dl>
        <div className={s.actions}>
          <Button variant="chip" onClick={() => setStep('edit')}>고치기</Button>
          <Button onClick={submit}>제출하기</Button>
        </div>
      </section>
    )
  }

  const field = (key: Key, extra?: { inputMode?: 'numeric' | 'decimal' }) => (
    <Field
      id={`pf-${key}`} label={LABELS[key]} value={values[key]} onChange={change(key)}
      error={error?.key === key} aria-describedby={error?.key === key ? 'pf-error' : undefined} {...extra}
    />
  )

  return (
    <form className={p.form} onSubmit={preview} noValidate>
      <div className={p.row}>
        {field('fee')}
        {field('successFee', { inputMode: 'decimal' })}
      </div>
      <div className={p.row}>
        {field('period')}
        {field('lawyers', { inputMode: 'numeric' })}
      </div>
      {field('leadLawyer')}
      <Field
        multiline id="pf-strategy" label={LABELS.strategy} value={values.strategy} onChange={change('strategy')}
        error={error?.key === 'strategy'} aria-describedby={error?.key === 'strategy' ? 'pf-error' : undefined}
      />
      {error && <p id="pf-error" className={p.err} role="alert">{error.msg}</p>}
      <div className={`${s.actions} ${s.actionsEnd} ${p.actions}`}>
        <Button type="submit">미리보기</Button>
      </div>
    </form>
  )
}
