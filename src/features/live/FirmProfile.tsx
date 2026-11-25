'use client'
import {useState,type FormEvent} from 'react'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import {useSession} from '@/features/auth/SessionProvider'
import {call} from '@/lib/live-api'
import {getSupabase} from '@/lib/supabase'
import p from '@/components/layout/Page.module.css'
export default function FirmProfile(){
 const {profile,loading,refresh}=useSession(),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function run(task:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await task()}catch(e){setError(e instanceof Error?e.message:'요청에 실패했습니다.')}finally{setBusy(false)}}
 function apply(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=new FormData(e.currentTarget);void run(async()=>{
  const file=form.get('certificate');if(!(file instanceof File)||!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size<1||file.size>10000000)throw new Error('사업자 등록증은 JPG·PNG·PDF, 10MB 이하로 선택해 주세요.')
  const path=`${profile!.profile.id}/${crypto.randomUUID()}.${file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'pdf'}`
  const up=await getSupabase().storage.from('firm-certs').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw new Error('등록증 업로드에 실패했습니다.')
  try{await call('createFirmApplication',{firmName:String(form.get('firmName')),bizNo:String(form.get('bizNo')).replace(/-/g,''),certPath:path,lawyers:[{name:String(form.get('lawyer')),regNo:String(form.get('regNo'))}]})}
  catch(e){await getSupabase().storage.from('firm-certs').remove([path]);throw e}
  await refresh()
 })}
 if(loading)return <p>로펌 정보를 불러오고 있습니다.</p>
 if(profile?.profile.role!=='firm')return <div className={p.page}><p>로펌 계정으로 로그인해 주세요.</p><Button href="/login/firm">로펌 로그인</Button><Button href="/signup" variant="chip">계정·프로필 등록</Button></div>
 const firm=profile.firm
 return <div className={`${p.page} ${p.narrow}`}><h1 className={p.title}>로펌 정보</h1>{error&&<p role="alert">{error}</p>}
  {firm?<><h2>{firm.firmName}</h2><p>승인 상태: {firm.approvalStatus}</p><p>사업자 상태: {firm.bizStatus}</p>
   <p>사업자 상태 확인과 로펌 승인은 별개입니다. 승인 대기 중에는 제안서를 제출할 수 없습니다.</p>
   <Button disabled={busy} onClick={()=>void run(async()=>{await call('verifyBusiness');await refresh()})}>사업자 상태 조회</Button>
   <Button variant="chip" disabled={busy} onClick={()=>void run(refresh)}>승인 상태 새로고침</Button>
  </>:<form onSubmit={apply}>
   <p>로펌 정보를 등록하면 운영자 검토를 기다립니다. 테스트는 개발 프로젝트에 가상 로펌으로 등록해 주세요.</p>
   <Field label="로펌명" name="firmName" required maxLength={100}/>
   <Field label="사업자등록번호" name="bizNo" required pattern="[0-9]{10}" inputMode="numeric"/>
   <Field label="변호사 이름" name="lawyer" required maxLength={100}/>
   <Field label="변호사 등록번호" name="regNo" required maxLength={100}/>
   <label>사업자 등록증 <input name="certificate" type="file" accept="image/jpeg,image/png,application/pdf" required/></label>
   <Button disabled={busy} type="submit">로펌 승인 신청</Button>
  </form>}
 </div>
}
