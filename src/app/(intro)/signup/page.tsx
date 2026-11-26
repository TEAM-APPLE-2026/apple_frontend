'use client'
import {useEffect,useState,type FormEvent} from 'react'
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
 const [signedIn,setSignedIn]=useState(false),[ready,setReady]=useState(false),[confirmationSent,setConfirmationSent]=useState(false)
 useEffect(()=>{
  let alive=true
  void getSupabase().auth.getSession().then(({data,error})=>{
   if(!alive)return
   if(error)setMessage('로그인 상태를 확인하지 못했어요. 다시 시도해 주세요.')
   setSignedIn(Boolean(data.session))
   const selected=new URLSearchParams(window.location.search).get('role')??sessionStorage.getItem('hande:signup-role')
   if(selected==='firm'||selected==='user')setRole(selected)
   setReady(true)
  }).catch(()=>{if(alive){setMessage('연결 설정을 확인해 주세요.');setReady(true)}})
  return()=>{alive=false}
 },[])
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;const form=new FormData(e.currentTarget)
  const email=String(form.get('email')??'').trim(),password=String(form.get('password')??'')
  if(!signedIn&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8)){
   setMessage('인증 메일을 받을 수 있는 이메일 주소와 8자 이상의 비밀번호를 입력해 주세요.');return
  }
  sessionStorage.setItem('hande:signup-role',role)
  setBusy(true);setMessage('')
  try{
   const session=await getSupabase().auth.getSession();if(session.error)throw session.error
   if(!session.data.session){
    const created=await call<{requiresEmailConfirmation:boolean}>('signUp',{email,password})
    if(created.requiresEmailConfirmation){setConfirmationSent(true);setMessage('인증 메일을 확인한 뒤 로그인하고 이 화면에서 프로필 등록을 완료해 주세요.');return}
   }
   await call('completeSignup',{role,nickname:String(form.get('nickname')),realName:role==='user'?String(form.get('realName')):null,phone:role==='user'?String(form.get('phone')):null})
   await refresh();router.push(role==='firm'?'/firm/profile':'/home')
  }catch(error){setMessage(error instanceof Error?error.message:'계정을 등록하지 못했어요.')}
  finally{setBusy(false)}
 }
 return <div className={`${p.page} ${p.narrow}`}><h1 className={p.title}>계정·프로필 등록</h1>
  <p>이미 로그인한 계정은 프로필만 등록합니다. 기존 프로필의 역할은 바꿀 수 없어요.</p>{message&&<p role="status">{message}</p>}
  <form onSubmit={submit}>
   <label>계정 유형 <select value={role} onChange={e=>{setRole(e.target.value);sessionStorage.setItem('hande:signup-role',e.target.value)}}><option value="user">피해자</option><option value="firm">로펌</option></select></label>
   {!signedIn&&<><Field label="이메일 (새 계정)" name="email" type="email" autoComplete="email" required/>
   <Field label="비밀번호 (새 계정)" name="password" type="password" minLength={8} autoComplete="new-password" required/></>}
   <Field label="닉네임" name="nickname" required maxLength={40}/>
   {role==='user'&&<><Field label="이름" name="realName" required maxLength={100}/><Field label="연락처 (숫자만)" name="phone" required inputMode="tel"/></>}
   {confirmationSent?<Button href={role==='firm'?'/login/firm':'/login'}>이메일 인증 후 로그인하기</Button>:<Button type="submit" disabled={busy||!ready}>{busy?'등록 중…':signedIn?'프로필 등록하기':'등록하기'}</Button>}
  </form>
 </div>
}
