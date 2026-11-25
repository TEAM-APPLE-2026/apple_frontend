'use client'
import {useEffect,useState} from 'react'
import Button from '@/components/common/Button'
import {getSupabase} from '@/lib/supabase'
import {call} from '@/lib/live-api'
type Evidence={evidenceId:string;originalName:string;status:string;objectPath:string;bucketId:string}
export default function EvidenceFiles({reportId}:{reportId:string}){
 const [items,setItems]=useState<Evidence[]>([]),[retry,setRetry]=useState<string[]>([]),[kind,setKind]=useState('notice'),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{let live=true;void getSupabase().from('evidences').select('id,original_name,status,object_path,bucket_id').eq('report_id',reportId).then(r=>{if(!live)return;if(r.error)setError('증빙 목록을 불러오지 못했어요.');else setItems((r.data??[]).map(x=>({evidenceId:x.id,originalName:x.original_name,status:x.status,objectPath:x.object_path,bucketId:x.bucket_id}))) });return()=>{live=false}},[reportId])
 async function run(job:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await job()}catch(e){setError(e instanceof Error?e.message:'파일 처리 실패. 다시 시도해 주세요.')}finally{setBusy(false)}}
 async function confirm(id:string){const r=await call<{status:string}>('confirmEvidence',{evidenceId:id});setItems(xs=>xs.map(x=>x.evidenceId===id?{...x,status:r.status}:x))}
 return <section><h2>증빙 파일</h2><p>선택 사항 · JPG/PNG/PDF · 파일당 10MB · 사례당 10개</p>{error&&<p role="alert">{error}</p>}
  <label>자료 종류 <select value={kind} onChange={e=>setKind(e.target.value)}><option value="notice">유출 안내</option><option value="smishing">스미싱</option><option value="payment">결제 내역</option><option value="other">기타</option></select></label>
  <input aria-label="증빙 파일 선택" type="file" accept="image/jpeg,image/png,application/pdf" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;void run(async()=>{
   if(!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size<1||file.size>10000000)throw new Error('지원 형식과 10MB 이하 용량을 확인해 주세요.')
   const row=await call<Evidence>('createEvidenceUpload',{reportId,kind,originalName:file.name,mimeType:file.type,sizeBytes:file.size});setItems(xs=>[...xs,row])
   const uploaded=await getSupabase().storage.from(row.bucketId).upload(row.objectPath,file,{contentType:file.type,upsert:false});if(uploaded.error)throw new Error('업로드하지 못했어요. 남은 항목을 삭제한 후 다시 선택해 주세요.')
   await confirm(row.evidenceId)
  })}}/>
  <ul>{items.map(x=><li key={x.evidenceId}>{x.originalName} · {x.status==='ready'?'검증 완료':x.status==='failed'?'검증 실패':'확인 대기'}
   {x.status==='pending'&&<Button variant="chip" size="sm" disabled={busy} onClick={()=>void run(()=>confirm(x.evidenceId))}>확인 재시도</Button>}
   <Button variant="chip" size="sm" disabled={busy} onClick={()=>void run(async()=>{const r=await call<{objectRemoved:boolean;objectPath:string}>('deleteEvidence',{evidenceId:x.evidenceId});setItems(xs=>xs.filter(i=>i.evidenceId!==x.evidenceId));if(!r.objectRemoved)setRetry(xs=>[...xs,r.objectPath])})}>삭제</Button>
  </li>)}</ul>
  {retry.map(path=><Button key={path} disabled={busy} variant="chip" onClick={()=>void run(async()=>{const r=await getSupabase().storage.from('evidences').remove([path]);if(r.error)throw new Error('파일 삭제 재시도에 실패했어요.');setRetry(xs=>xs.filter(x=>x!==path))})}>남은 파일 삭제 재시도</Button>)}
 </section>
}
