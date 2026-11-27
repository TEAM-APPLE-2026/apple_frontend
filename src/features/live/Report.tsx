'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Checkbox from '@/components/common/Checkbox'
import Icon from '@/components/common/Icon'
import StateBox from '@/components/common/StateBox'
import stateBox from '@/components/common/StateBox.module.css'
import Stepper from '@/features/report/Stepper'
import {analyze,match,draftGroup,type ReportField,type MatchCandidate,type GroupDraft} from '@/lib/ai'
import {call,type Receipt,type Group,type Page} from '@/lib/live-api'
import {useSession} from '@/features/auth/SessionProvider'
import {routes} from '@/lib/routes'
import p from '@/components/layout/Page.module.css'
import s from '@/features/report/ReportFlow.module.css'
import EvidenceFiles from './EvidenceFiles'
const labels:Record<string,string>={company:'상대 기업',type:'피해 유형',notice_date:'통지 시점',leaked:'유출된 정보',secondary:'2차 피해',secondary_detail:'2차 피해 상세',card:'카드 정보 유출'}
const value=(f:ReportField)=>f.source==='user'?f.userValue:f.aiValue
const fail=(e:unknown)=>e instanceof Error?e.message:'처리하지 못했어요. 다시 시도해 주세요.'
export default function LiveReport(){
 const router=useRouter(),{profile,loading}=useSession()
 const [step,setStep]=useState<'write'|'review'|'match'|'group'>('write'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [raw,setRaw]=useState(''),[fields,setFields]=useState<ReportField[]>([]),[warnings,setWarnings]=useState<string[]>([])
 const [reportId,setReportId]=useState<string|null>(null),[checked,setChecked]=useState(false),[publicChecked,setPublicChecked]=useState(false)
 const [groups,setGroups]=useState<Group[]>([]),[matches,setMatches]=useState<MatchCandidate[]>([]),[draft,setDraft]=useState<GroupDraft|null>(null)
 const [analyzing,setAnalyzing]=useState(false)
 async function run(job:()=>Promise<void>){if(busy)return;setBusy(true);setError('');try{await job()}catch(e){setError(fail(e))}finally{setBusy(false)}}
 const edit=(key:string,userValue:ReportField['userValue'])=>{setChecked(false);setFields(items=>items.map(f=>f.key===key?{...f,userValue,source:'user',needsCheck:userValue===null}:f))}
 async function analyzeReport(){await run(async()=>{
  setAnalyzing(true);window.scrollTo({top:0})
  try{
  const result=await analyze(raw,{timeoutMs:20000})
  if('error'in result)throw new Error(result.error.message)
  const saved=await call<Receipt>('saveReport',{rawText:raw,fields:result.data.fields})
  await call('getReport',{reportId:saved.reportId})
  setReportId(saved.reportId);setFields(result.data.fields);setWarnings(result.data.warnings);setChecked(false);setStep('review')
  }finally{setAnalyzing(false)}
 })}
 async function confirm(){await run(async()=>{
  if(!checked||fields.some(f=>f.key!=='secondary_detail'&&(f.needsCheck||value(f)===null)))throw new Error('확인이 필요한 값을 입력하거나 모름을 선택해 주세요.')
  await call('saveReport',{reportId,rawText:raw,fields})
  await call('finalizeReport',{reportId})
  sessionStorage.setItem(`hande:last-report:${profile!.profile.id}`,reportId!)
  const company=String(value(fields.find(f=>f.key==='company')!))
  const all:Group[]=[];let cursor:string|null=null
  do {const page:Page<Group>=await call<Page<Group>>('listGroups',{company,cursor,limit:100});all.push(...page.items);cursor=page.nextCursor}while(cursor)
  setGroups(all);setMatches(match({fields},all));setStep('match')
 })}
 function startGroup(){const d=draftGroup({fields});if('error'in d){setError('기업명을 확인해 주세요.');return}setDraft(d);setPublicChecked(false);setStep('group')}
 if(loading)return <p>로그인 상태를 확인하고 있어요.</p>
 if(profile?.profile.role!=='user')return <div className={p.page}><h1>피해자 로그인이 필요해요</h1><Button href="/login">로그인하기</Button></div>
 return <div className={`${p.page} ${p.narrow}`}>
  <Stepper step={analyzing?2:step==='write'?1:step==='review'?2:3}/>
  {error&&<p role="alert">{error}</p>}{busy&&!analyzing&&<p role="status">처리하고 있어요.</p>}
  {analyzing&&<>
   <h1 className={s.title}>AI가 정리하고 있어요</h1>
   <div className={s.box}><StateBox icon={<Icon name="spinner" size={32} className={stateBox.spin}/>} title="잠시만 기다려 주세요" desc="쓴 글에서 기업 · 피해 유형 · 시기를 찾는 중이에요. 보통 몇 초면 끝나요."/></div>
  </>}
  {step==='write'&&!analyzing&&<form onSubmit={e=>{e.preventDefault();void analyzeReport()}}>
   <h1 className={s.title}>어떤 피해를 입으셨나요?</h1><p className={p.sub}>겪은 일을 적으면 AI가 정리해요. 원문에 불필요한 주민번호·계좌번호는 적지 마세요.</p>
   <Field multiline label="겪은 일" value={raw} maxLength={2000} onChange={e=>setRaw(e.target.value)} required/>
   <Button type="submit" disabled={busy||!raw.trim()}>다음 · AI 정리 보기</Button>
  </form>}
  {step==='review'&&<>
   <h1 className={s.title}>이렇게 정리했어요</h1><blockquote className={s.quote}>{raw}</blockquote>
   {warnings.length>0&&<ul role="alert">{warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>}
   <ul className={s.frows}>{fields.map(f=>{
    const v=value(f)
    return <li className={`${s.frow} ${f.needsCheck?s.need:''}`} key={f.key}>
     <span className={s.fLabel}>{labels[f.key]}</span><div className={s.fValue}>
     {f.key==='type'?<p>개인정보 유출 <Button size="sm" variant="chip" onClick={()=>edit(f.key,'privacy_leak')}>확인</Button></p>:
      f.key==='secondary'||f.key==='card'?<select aria-label={labels[f.key]} value={typeof v==='string'?v:''} onChange={e=>edit(f.key,e.target.value||null)}><option value="">선택해 주세요</option><option value="yes">있음</option><option value="no">없음</option><option value="unknown">모름</option></select>:
      f.key==='notice_date'?<>
       <Field label="통지를 받은 날짜" type="date" value={v&&typeof v==='object'&&!Array.isArray(v)?v.from??'':''} onChange={e=>edit(f.key,e.target.value?{from:e.target.value,to:e.target.value,precision:'day'}:null)}/>
       {v&&typeof v==='object'&&!Array.isArray(v)&&<p>{v.from??'모름'} ~ {v.to??'모름'} · {v.precision}</p>}
       <Button variant="chip" size="sm" onClick={()=>edit(f.key,{from:null,to:null,precision:'unknown'})}>시점 모름</Button>
      </>:<Field label={f.key==='leaked'?'유출 정보 (쉼표로 구분)':labels[f.key]} value={Array.isArray(v)?v.join(', '):typeof v==='string'?v:''} onChange={e=>edit(f.key,f.key==='leaked'?e.target.value.split(',').map(x=>x.trim()).filter(Boolean):e.target.value||null)}/>}
     {f.key==='leaked'&&<Button variant="chip" size="sm" onClick={()=>edit(f.key,[])}>확인된 항목 없음</Button>}
     {f.quote&&<p className={s.src}>원문 근거: “{f.quote}”</p>}
     {f.needsCheck&&v!==null&&<Button variant="chip" size="sm" onClick={()=>edit(f.key,v)}>이 값으로 확인</Button>}
     </div>
    </li>
   })}</ul>
   {reportId&&<EvidenceFiles reportId={reportId}/>}
   <Checkbox label="정리한 값을 확인했고, 확인이 필요한 부분을 수정했어요." checked={checked} onChange={e=>setChecked(e.target.checked)}/>
   <div className={p.actions}><Button variant="chip" disabled={busy} onClick={()=>setStep('write')}>글 다시 쓰기</Button><Button disabled={busy||!checked} onClick={()=>void confirm()}>확인·저장하고 같은 사건 찾기</Button></div>
  </>}
  {step==='match'&&<>
   <h1 className={s.title}>같은 사건 찾기</h1><p className={p.sub}>점수는 AI의 추천 점수예요. 같은 사건인지 내용을 확인해 주세요.</p>
   {!matches.length&&<p>비슷한 사건을 찾지 못했어요.</p>}
   <ul>{matches.map(m=>{const g=groups.find(g=>g.id===m.groupId)!;return <li className={p.dlBox} style={{padding:24,marginBottom:16}} key={m.groupId}>
    <h2>{g.name}</h2><p>{m.score}점 · {g.memberCount}명</p><p>{g.description}</p><p>{m.matches.join(' · ')}</p><p>{m.diffs.join(' · ')}</p>
    <Button variant="chip" href={routes.caseView(g.id)}>사건 자세히 보기</Button><Button disabled={busy} onClick={()=>void run(async()=>{await call('joinGroup',{groupId:g.id,reportId});router.push(routes.groupView(g.id))})}>이 사건에 참여하기</Button>
   </li>})}</ul>
   <Button variant="chip" onClick={()=>setStep('review')}>정리값 수정</Button><Button disabled={busy} onClick={startGroup}>새 그룹 만들기</Button>
  </>}
  {step==='group'&&draft&&<form onSubmit={e=>{e.preventDefault();void run(async()=>{
   if(!publicChecked)throw new Error('공개될 그룹 내용을 확인해 주세요.')
   const created=await call<{groupId:string}>('createGroup',{reportId,...draft})
   router.push(routes.groupView(created.groupId))
  })}}>
   <h1 className={s.title}>새 그룹으로 열까요?</h1><p className={p.sub}>아래 내용은 다른 사용자에게 공개돼요. 원문·연락처 등 개인정보가 들어가지 않았는지 확인해 주세요.</p>
   <Field label="그룹명" value={draft.name} maxLength={100} required onChange={e=>setDraft({...draft,name:e.target.value})}/>
   <Field label="그룹 설명" multiline value={draft.description} maxLength={2000} required onChange={e=>setDraft({...draft,description:e.target.value})}/>
   <Field label="참여 조건" multiline value={draft.conditions} maxLength={1000} onChange={e=>setDraft({...draft,conditions:e.target.value})}/>
   <p>{draft.company} · 개인정보 유출 · 10명이 모이면 개설자가 대표자 투표를 열 수 있어요.</p>
   <Checkbox label="공개되는 그룹 내용을 확인했어요." checked={publicChecked} onChange={e=>setPublicChecked(e.target.checked)}/>
   <Button disabled={busy} variant="chip" onClick={()=>setStep('match')}>이전</Button><Button type="submit" disabled={busy||!publicChecked}>새 그룹 열기</Button>
  </form>}
 </div>
}
