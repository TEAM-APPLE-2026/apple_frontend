'use client'
import {useState,type FormEvent} from 'react'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import {useSession} from '@/features/auth/SessionProvider'
import {firmActions} from '@/features/firm/store'
import {call,type BusinessCheck} from '@/lib/live-api'
import {getSupabase} from '@/lib/supabase'
import p from '@/components/layout/Page.module.css'

// 표시는 쉬운 말로. 디자인은 프론트 담당이 나중에 다듬는다.
const VALID:Record<string,string>={valid:'일치',invalid:'불일치'}
const BIZ:Record<string,string>={active:'계속',suspended:'휴업',closed:'폐업'}
const APPROVAL:Record<string,string>={approved:'승인됨',pending:'검토 중',rejected:'거절'}
const approvalNote=(s:string)=>s==='approved'?'승인되었습니다. 이제 제안서를 낼 수 있어요':s==='rejected'?'신청이 거절되었어요.':'운영자 검토 후 승인돼요'
const checkToast=(r:BusinessCheck)=>`사업자 확인 결과: 진위확인 ${VALID[r.bizValid]??'확인 불가'}, 사업자 상태 ${BIZ[r.bizStatus]??'확인 불가'}. ${approvalNote(r.approvalStatus)}`

/** 하이픈·공백을 지우고 숫자 10자리만 남긴다. 형식이 맞지 않으면 null. */
export function normalizeBizNo(raw:string){const v=raw.replace(/[\s-]/g,'');return /^[0-9]{10}$/.test(v)?v:null}

export default function FirmProfile(){
 const {profile,loading,refresh}=useSession(),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function run(task:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await task()}catch(e){setError(e instanceof Error?e.message:'요청에 실패했습니다.')}finally{setBusy(false)}}
 async function verify(){
  try{const r=await call<BusinessCheck>('verifyBusiness');await refresh();firmActions.showToast(checkToast(r))}
  catch(e){await refresh();throw new Error(`사업자 확인을 하지 못했어요. 잠시 후 '사업자 상태 조회'를 다시 눌러 주세요. (${e instanceof Error?e.message:'오류'})`)}
 }
 function apply(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=new FormData(e.currentTarget);void run(async()=>{
  const bizNo=normalizeBizNo(String(form.get('bizNo')??''))
  if(!bizNo)throw new Error('사업자등록번호는 숫자 10자리로 입력해 주세요. (하이픈은 넣어도 괜찮아요)')
  const openDate=String(form.get('openDate')??'')
  if(!/^\d{4}-\d{2}-\d{2}$/.test(openDate))throw new Error('개업일자를 선택해 주세요.')
  const file=form.get('certificate');if(!(file instanceof File)||!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size<1||file.size>10000000)throw new Error('사업자 등록증은 JPG·PNG·PDF, 10MB 이하로 선택해 주세요.')
  const path=`${profile!.profile.id}/${crypto.randomUUID()}.${file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'pdf'}`
  const up=await getSupabase().storage.from('firm-certs').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw new Error('등록증 업로드에 실패했습니다.')
  try{await call('createFirmApplication',{firmName:String(form.get('firmName')).trim(),bizNo,repName:String(form.get('repName')).trim(),openDate,certPath:path})}
  catch(e){await getSupabase().storage.from('firm-certs').remove([path]);throw e}
  // 신청이 접수되면 바로 사업자 확인을 실행한다.
  await verify()
 })}
 if(loading)return <p>로펌 정보를 불러오고 있습니다.</p>
 if(profile?.profile.role!=='firm')return <div className={p.page}><p>로펌 계정으로 로그인해 주세요.</p><Button href="/login/firm">로펌 로그인</Button><Button href="/signup" variant="chip">계정·프로필 등록</Button></div>
 const firm=profile.firm
 return <div className={`${p.page} ${p.narrow}`}><h1 className={p.title}>로펌 정보</h1>{error&&<p role="alert" className={p.note}>{error}</p>}
  {firm?<>
   <dl className={`${p.dl} ${p.dlBox}`}>
    <div className={p.dlRow}><dt className={p.dt}>로펌명</dt><dd className={p.dd}>{firm.firmName}</dd></div>
    <div className={p.dlRow}><dt className={p.dt}>진위확인</dt><dd className={p.dd}>{VALID[firm.bizValid]??'확인 불가'}</dd></div>
    <div className={p.dlRow}><dt className={p.dt}>사업자 상태</dt><dd className={p.dd}>{BIZ[firm.bizStatus]??'확인 불가'}</dd></div>
    <div className={p.dlRow}><dt className={p.dt}>승인 상태</dt><dd className={p.dd}>{APPROVAL[firm.approvalStatus]??'검토 중'}</dd></div>
   </dl>
   <p className={p.note}>{approvalNote(firm.approvalStatus)}{firm.approvalStatus==='rejected'&&firm.rejectReason?` 사유: ${firm.rejectReason}`:''}</p>
   <div className={`${p.actions} ${p.actionsStart}`}>
    <Button disabled={busy} onClick={()=>void run(verify)}>사업자 상태 조회</Button>
    <Button variant="chip" disabled={busy} onClick={()=>void run(refresh)}>승인 상태 새로고침</Button>
   </div>
  </>:<form onSubmit={apply}>
   <p className={p.sub}>신청하면 바로 국세청 사업자 확인을 진행해요. 테스트는 개발 프로젝트에 가상 로펌으로 등록해 주세요.</p>
   <Field label="로펌명" name="firmName" required maxLength={100}/>
   <Field label="사업자등록번호" name="bizNo" required maxLength={20} inputMode="numeric" placeholder="123-45-67890"/>
   <Field label="대표자명" name="repName" required maxLength={100}/>
   <Field label="개업일자" name="openDate" type="date" required/>
   <label className={p.filter}>사업자 등록증 (JPG·PNG·PDF, 10MB 이하)<input name="certificate" type="file" accept="image/jpeg,image/png,application/pdf" required/></label>
   <div className={`${p.actions} ${p.actionsStart}`}><Button disabled={busy} type="submit">{busy?'확인 중…':'로펌 승인 신청'}</Button></div>
  </form>}
 </div>
}
