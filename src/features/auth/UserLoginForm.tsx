'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Icon from '@/components/common/Icon'
import { userActions } from '@/features/user/store'
import { BackendError, call, type Profile } from '@/lib/live-api'
import { useSession } from './SessionProvider'
import s from './AuthPage.module.css'

// I-05 일반 사용자 로그인 · I-06 실패
export default function UserLoginForm() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const { refresh } = useSession()

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy) return
    const form = new FormData(e.currentTarget)
    setBusy(true); setFailed(false)
    try {
      await call('signIn', {email:String(form.get('email')), password:String(form.get('password'))})
      const p = await call<Profile>('getMyProfile')
      if (p.profile.role !== 'user') { await call('signOut'); throw new Error('피해자 계정으로 로그인해 주세요. 로펌 계정은 로펌 로그인을 이용해 주세요.') }
      await refresh(); userActions.loginReal(); router.push('/home')
    } catch(error) { if(error instanceof BackendError && error.code==='PROFILE_INCOMPLETE'){router.push('/signup');return} setFailed(true);setMessage(error instanceof Error ? error.message : '로그인하지 못했어요. 다시 시도해 주세요.') }
    finally {setBusy(false)}
  }

  return (
    <form className={s.form} onSubmit={submit}>
      {failed && (
        <p className={s.formErr} role="alert">
          <Icon name="alert" size={16} />
          {message}
        </p>
      )}
      <Field label="이메일" name="email" type="email" autoComplete="email" placeholder="calm-sea@example.com" required />
      <Field label="비밀번호" name="password" type="password" autoComplete="current-password" required error={failed} onChange={() => setFailed(false)} />
      <Button type="submit" block disabled={busy}>{busy ? '로그인 중…' : '로그인하기'}</Button>
    </form>
  )
}
