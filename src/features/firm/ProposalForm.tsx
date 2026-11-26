'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import { call, friendlyError, formatWon, type Proposal, type ProposalInput } from '@/lib/live-api'
import { firmActions } from './store'
import s from '@/components/layout/Page.module.css'
import p from './ProposalForm.module.css'

type Values = { fee: string; successFee: string; period: string; lawyers: string; leadLawyer: string; strategy: string }
type Key = keyof Values

const LABELS: Record<Key, string> = {
  fee: '착수금 (1인당 · 원)',
  successFee: '성공보수 (%)',
  period: '예상 기간',
  lawyers: '담당 변호사 수',
  leadLawyer: '담당 변호사 (대표)',
  strategy: '대응 전략',
}
// 칸 이름만 (메시지용)
const NAMES: Record<Key, string> = { fee: '착수금', successFee: '성공보수', period: '예상 기간', lawyers: '담당 변호사 수', leadLawyer: '담당 변호사', strategy: '대응 전략' }
const PLACEHOLDER: Partial<Record<Key, string>> = { fee: '20000 (없으면 0)', successFee: '12', period: '6~10개월', lawyers: '3', leadLawyer: '대표 담당 변호사 이름' }
// 서버 검사와 같은 기준 (backend validate_proposal)
const MAX: Record<Key, number> = { fee: 14, successFee: 6, period: 200, lawyers: 4, leadLawyer: 100, strategy: 3000 }

const empty: Values = { fee: '', successFee: '', period: '', lawyers: '', leadLawyer: '', strategy: '' }
const fromProposal = (x: Proposal): Values => ({
  fee: String(x.retainerFee), successFee: String(x.successFeePct), period: x.period,
  lawyers: String(x.lawyerCount), leadLawyer: x.leadLawyer, strategy: x.strategy,
})
const toInput = (v: Values): ProposalInput => ({
  retainerFee: Number(v.fee), successFeePct: Number(v.successFee), period: v.period.trim(),
  strategy: v.strategy.trim(), lawyerCount: Number(v.lawyers), leadLawyer: v.leadLawyer.trim(),
})

function validate(v: Values): { key: Key; msg: string } | null {
  for (const key of Object.keys(LABELS) as Key[]) {
    const value = v[key].trim()
    if (!value) return { key, msg: `${NAMES[key]} 칸을 채워 주세요.` }
  }
  if (!/^\d+$/.test(v.fee.trim())) return { key: 'fee', msg: '착수금은 원 단위 숫자만 입력합니다. 없으면 0을 입력해 주세요.' }
  if (!/^\d+(\.\d{1,2})?$/.test(v.successFee.trim()) || Number(v.successFee) > 100) return { key: 'successFee', msg: '성공보수는 0~100 사이 숫자로 입력해 주세요. (소수점 둘째 자리까지)' }
  if (!/^\d+$/.test(v.lawyers.trim()) || Number(v.lawyers) < 1) return { key: 'lawyers', msg: '담당 변호사 수는 1명 이상 숫자로 입력해 주세요.' }
  return null
}

// F-05 작성 → (F-06 입력 확인 필요) → F-07 제출 전 확인 → 제출 (F-09) · 제출한 제안서 수정 · 철회
export default function ProposalForm({ groupId, existing, canEdit, onChanged }: {
  groupId: string; existing: Proposal | null; canEdit: boolean; onChanged: () => Promise<void>
}) {
  const router = useRouter()
  const [values, setValues] = useState<Values>(() => (existing ? fromProposal(existing) : empty))
  const [error, setError] = useState<{ key: Key | null; msg: string } | null>(null)
  const [step, setStep] = useState<'edit' | 'preview'>('edit')
  const [busy, setBusy] = useState(false)

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

  const run = async (task: () => Promise<unknown>, toast: string) => {
    if (busy) return
    setBusy(true); setError(null)
    try {
      await task()
      firmActions.showToast(toast)
      router.push('/firm/proposals')
    } catch (e) {
      setError({ key: null, msg: friendlyError(e, 'proposal') })
      setStep('edit')
      await onChanged()
    } finally { setBusy(false) }
  }
  // 철회한 제안서도 updateProposal로 다시 제출된다(서버가 status를 submitted로 바꿈)
  const submit = () => run(
    () => existing ? call('updateProposal', { proposalId: existing.id, proposal: toInput(values) }) : call('submitProposal', { groupId, proposal: toInput(values) }),
    existing?.status === 'submitted' ? '수임 제안서를 수정했습니다' : '수임 제안서를 제출했습니다',
  )
  const withdraw = () => {
    if (!existing || !window.confirm('제안서를 철회할까요? 접수 마감 전에는 다시 제출할 수 있습니다.')) return
    void run(() => call('withdrawProposal', { proposalId: existing.id }), '수임 제안서를 철회했습니다')
  }

  if (!canEdit) {
    return <p className={s.note}>지금은 이 그룹에 제안서를 내거나 고칠 수 없습니다. 제안 접수 기간(대표자가 정한 마감일 전)에만 가능합니다.</p>
  }

  if (step === 'preview') {
    const n = Number(values.lawyers)
    const rows: [string, string][] = [
      ['착수금', formatWon(Number(values.fee))],
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
          <Button variant="chip" disabled={busy} onClick={() => setStep('edit')}>고치기</Button>
          <Button disabled={busy} onClick={() => void submit()}>{busy ? '보내는 중…' : existing?.status === 'submitted' ? '수정 내용 제출하기' : '제출하기'}</Button>
        </div>
      </section>
    )
  }

  const field = (key: Key, extra?: { inputMode?: 'numeric' | 'decimal' }) => (
    <Field
      id={`pf-${key}`} label={LABELS[key]} value={values[key]} onChange={change(key)} placeholder={PLACEHOLDER[key]} maxLength={MAX[key]}
      error={error?.key === key} aria-describedby={error?.key === key ? 'pf-error' : undefined} {...extra}
    />
  )

  return (
    <form className={p.form} onSubmit={preview} noValidate>
      {existing && <p className={s.note}>{existing.status === 'withdrawn' ? '철회한 제안서입니다. 내용을 확인하고 다시 제출할 수 있습니다.' : '제출한 제안서입니다. 접수 마감 전까지 고치거나 철회할 수 있습니다.'}</p>}
      <div className={p.row}>
        {field('fee', { inputMode: 'numeric' })}
        {field('successFee', { inputMode: 'decimal' })}
      </div>
      <div className={p.row}>
        {field('period')}
        {field('lawyers', { inputMode: 'numeric' })}
      </div>
      {field('leadLawyer')}
      <Field
        multiline id="pf-strategy" label={LABELS.strategy} value={values.strategy} onChange={change('strategy')} maxLength={MAX.strategy}
        error={error?.key === 'strategy'} aria-describedby={error?.key === 'strategy' ? 'pf-error' : undefined}
      />
      {error && <p id="pf-error" className={p.err} role="alert">{error.msg}</p>}
      <div className={`${s.actions} ${s.actionsEnd} ${p.actions}`}>
        {existing?.status === 'submitted' && <Button variant="chip" disabled={busy} onClick={withdraw}>제안서 철회</Button>}
        <Button type="submit" disabled={busy}>미리보기</Button>
      </div>
    </form>
  )
}
