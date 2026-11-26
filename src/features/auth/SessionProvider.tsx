'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { getSupabase } from '@/lib/supabase'
import { call, type Profile } from '@/lib/live-api'
import { userActions } from '@/features/user/store'
import { firmActions } from '@/features/firm/store'
const Context = createContext<{profile: Profile | null; loading: boolean; error: string; refresh: () => Promise<void>}>({profile:null,loading:true,error:'',refresh:async()=>{}})
export const useSession = () => useContext(Context)
export default function SessionProvider({children}:{children:ReactNode}) {
 const [profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const generation=useRef(0)
 const refresh=useCallback(async()=>{
  const request=++generation.current
  try {
   const {data,error}=await getSupabase().auth.getSession()
   if(error)throw error
   const p=data.session?await call<Profile>('getMyProfile'):null
   if(request!==generation.current)return
   setProfile(p);setError('')
   if(p?.profile.role==='user')userActions.loginReal();else userActions.logout()
   if(p?.profile.role==='firm')firmActions.login('로그인했습니다');else firmActions.reset()
  } catch {if(request!==generation.current)return;setProfile(null);userActions.logout();firmActions.reset();setError('로그인 상태를 확인하지 못했어요. 다시 로그인해 주세요.')}
  finally{if(request===generation.current)setLoading(false)}
 },[])
 useEffect(()=>{
  let mounted=true
  const sync=()=>{if(mounted)void refresh()}
  const invalidate=()=>{generation.current++}
  queueMicrotask(sync)
  let unsubscribe=()=>{}
  try { const {data}=getSupabase().auth.onAuthStateChange(()=>queueMicrotask(sync));unsubscribe=()=>data.subscription.unsubscribe() }
  catch { queueMicrotask(()=>{if(mounted){setLoading(false);setError('연결 설정을 확인해 주세요.')}}) }
  return()=>{mounted=false;invalidate();unsubscribe()}
 },[refresh])
 return <Context.Provider value={{profile,loading,error,refresh}}>{children}</Context.Provider>
}
