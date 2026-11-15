'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Icon from '@/components/common/Icon'
import { FIRM } from '@/features/firm/data'
import { firmActions } from '@/features/firm/store'
import { demoCheckBiz, demoLogin } from './demo'
import s from './AuthPage.module.css'

type BizState = 'idle' | 'verified' | 'invalid' | 'required'

const BIZ_MSG: Record<Exclude<BizState, 'idle'>, { text: string; ok: boolean }> = {
  verified: { text: '국세청 사업자 상태 확인됨 [예시] · 계속사업자', ok: true },
  invalid: { text: '사업자등록번호 10자리를 확인해 주세요.', ok: false },
  required: { text: '사업자등록번호 "확인"을 먼저 눌러 주세요.', ok: false },
}

// I-07 로펌 로그인 · I-08 사업자 확인됨 · I-09 사업자 확인 필요 · I-10 실패
export default function FirmLoginForm() {
  const router = useRouter()
  const [biz, setBiz] = useState('')
  const [bizState, setBizState] = useState<BizState>('idle')
  const [failed, setFailed] = useState(false)

  const checkBiz = () => setBizState(demoCheckBiz(biz) ? 'verified' : 'invalid')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (bizState !== 'verified') return setBizState('required')
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    if (!demoLogin(password)) return setFailed(true)
    firmActions.login(`${FIRM.name}로 로그인했습니다`)
    router.push('/firm')
  }

  const msg = bizState === 'idle' ? null : BIZ_MSG[bizState]

  return (
    <form className={s.form} onSubmit={submit}>
      {failed && (
        <p className={s.formErr} role="alert">
          <Icon name="alert" size={16} />
          이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주십시오.
        </p>
      )}
      <Field label="이메일" name="email" type="email" autoComplete="email" placeholder="firm@example.com" required />
      <Field label="비밀번호" name="password" type="password" autoComplete="current-password" required error={failed} onChange={() => setFailed(false)} />
      <div className={s.bizField}>
        <label htmlFor="biz" className={s.bizLabel}>사업자등록번호</label>
        <div className={s.biz}>
          <Field
            id="biz" name="biz" inputMode="numeric" placeholder="123-45-67890" required
            value={biz}
            onChange={(e) => { setBiz(e.target.value); setBizState('idle') }}
            aria-describedby="biz-msg"
          />
          <Button variant="chip" onClick={checkBiz}>확인</Button>
        </div>
        <p id="biz-msg" className={`${s.msg} ${msg ? (msg.ok ? s.msgOk : s.msgErr) : ''}`} aria-live="polite">
          {msg?.text}
        </p>
      </div>
      <Button type="submit" block>로펌으로 로그인하기</Button>
    </form>
  )
}
