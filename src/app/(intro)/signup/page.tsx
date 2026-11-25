'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import {call} from '@/lib/live-api'
import {getSupabase} from '@/lib/supabase'
import {useSession} from '@/features/auth/SessionProvider'
import p from '@/components/layout/Page.module.css'
export default function Signup(){
 const router=useRouter(),{refresh}=useSession()
 const [role,setRole]=useState('user'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;const form=new FormData(e.currentTarget);setBusy(true);setMessage('')
  try{
   const session=await getSupabase().auth.getSession();if(session.error)throw session.error
   if(!session.data.session){
    const created=await call<{requiresEmailConfirmation:boolean}>('signUp',{email:String(form.get('email')),password:String(form.get('password'))})
    if(created.requiresEmailConfirmation){setMessage('인증 메일을 확인한 뒤 로그인하고 이 화면에서 프로필 등록을 완료해 주세요.');return}
   }
   await call('completeSignup',{role,nickname:String(form.get('nickname')),realName:role==='user'?String(form.get('realName')):null,phone:role==='user'?String(form.get('phone')):null})
   await refresh();router.push(role==='firm'?'/firm/profile':'/home')
  }catch(error){setMessage(error instanceof Error?error.message:'계정을 등록하지 못했어요.')}
  finally{setBusy(false)}
 }
 return <div className={`${p.page} ${p.narrow}`}><h1 className={p.title}>계정·프로필 등록</h1>
  <p>이미 로그인한 계정은 프로필만 등록합니다. 기존 프로필의 역할은 바꿀 수 없어요.</p>{message&&<p role="status">{message}</p>}
  <form onSubmit={submit}>
   <label>계정 유형 <select value={role} onChange={e=>setRole(e.target.value)}><option value="user">피해자</option><option value="firm">로펌</option></select></label>
   <Field label="이메일 (새 계정)" name="email" type="email" autoComplete="email"/>
   <Field label="비밀번호 (새 계정)" name="password" type="password" minLength={8} autoComplete="new-password"/>
   <Field label="닉네임" name="nickname" required maxLength={50}/>
   {role==='user'&&<><Field label="이름" name="realName" required maxLength={100}/><Field label="연락처 (숫자만)" name="phone" required inputMode="tel"/></>}
   <Button type="submit" disabled={busy}>{busy?'등록 중…':'등록하기'}</Button>
  </form>
 </div>
}
