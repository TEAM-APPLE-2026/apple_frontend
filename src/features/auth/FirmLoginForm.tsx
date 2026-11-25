'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import {BackendError,call,type Profile} from '@/lib/live-api'
import {useSession} from './SessionProvider'
import s from './AuthPage.module.css'
export default function FirmLoginForm(){
 const router=useRouter(),{refresh}=useSession()
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return
  const form=new FormData(e.currentTarget);setBusy(true);setMessage('')
  try{
   await call('signIn',{email:String(form.get('email')),password:String(form.get('password'))})
   const p=await call<Profile>('getMyProfile')
   if(p.profile.role!=='firm'){await call('signOut');throw new Error('로펌 계정으로 로그인해 주세요.')}
   await refresh();router.push('/firm/profile')
  }catch(error){if(error instanceof BackendError&&error.code==='PROFILE_INCOMPLETE'){router.push('/signup?role=firm');return}setMessage(error instanceof Error?error.message:'로그인하지 못했습니다.')}
  finally{setBusy(false)}
 }
 return <form className={s.form} onSubmit={submit}>
  {message&&<p role="alert" className={s.formErr}>{message}</p>}
  <Field label="이메일" name="email" type="email" autoComplete="email" required/>
  <Field label="비밀번호" name="password" type="password" autoComplete="current-password" required/>
  <p>로그인 후 로펌 정보에서 사업자 상태와 승인 여부를 확인합니다.</p>
  <Button type="submit" block disabled={busy}>{busy?'로그인 중…':'로펌으로 로그인하기'}</Button>
 </form>
}
