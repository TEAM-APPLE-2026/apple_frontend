'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Icon from '@/components/common/Icon'
import { userActions } from '@/features/user/store'
import { demoLogin } from './demo'
import s from './AuthPage.module.css'

// I-05 일반 사용자 로그인 · I-06 실패
export default function UserLoginForm() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    if (!demoLogin(password)) return setFailed(true)
    userActions.login()
    router.push('/home')
  }

  return (
    <form className={s.form} onSubmit={submit}>
      {failed && (
        <p className={s.formErr} role="alert">
          <Icon name="alert" size={16} />
          이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.
        </p>
      )}
      <Field label="이메일" name="email" type="email" autoComplete="email" placeholder="calm-sea@example.com" required />
      <Field label="비밀번호" name="password" type="password" autoComplete="current-password" required error={failed} onChange={() => setFailed(false)} />
      <Button type="submit" block>로그인하기</Button>
    </form>
  )
}
