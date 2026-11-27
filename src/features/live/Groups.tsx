'use client'
import {useCallback,useEffect,useState} from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import {call,type Group,type Page} from '@/lib/live-api'
import {getSupabase} from '@/lib/supabase'
import {routes} from '@/lib/routes'
import {useSession} from '@/features/auth/SessionProvider'
import p from '@/components/layout/Page.module.css'
import FirmsPanel from '@/features/groups/FirmsPanel'
import {PollStatus,canVote} from '@/features/groups/parts'
import {usePollPhase,withClock} from '@/features/groups/pollPhase'
const phase:Record<string,string>={recruiting:'모집 중',rep_election:'대표자 투표',method_vote:'대응 방법 투표',proposal_collection:'로펌 제안 접수',firm_vote:'로펌 투표',connected:'사건 진행 중',closed:'종결'}
const methodLabel:Record<string,string>={med:'분쟁조정',consumer:'소비자단체 상담',collective:'공동 대응',suit:'공동소송',representative:'대표자 선정',method:'대응 방법',firm:'로펌 선정'}
const voteState:Record<string,string>={scheduled:'시작 대기',open:'투표 중',closed:'마감',tied:'동점 · 재투표 필요',no_votes:'투표 없음',cancelled:'취소',completed:'집계 완료'}
const fail=(e:unknown)=>e instanceof Error?e.message:'불러오지 못했어요. 다시 시도해 주세요.'
export function GroupList({mine=false}:{mine?:boolean}){
 const {profile,loading:authLoading}=useSession()
 const [rows,setRows]=useState<Group[]>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const load=useCallback(async(next:string|null=null)=>{
  setLoading(true);setError('')
  try{
   if(mine){
    if(!profile){setRows([]);return}
    const membership=await getSupabase().from('group_members').select('group_id').is('left_at',null)
    if(membership.error)throw new Error('참여 그룹을 불러오지 못했어요.')
    const groups=await Promise.all((membership.data??[]).map(m=>call<Group>('getGroup',{groupId:m.group_id})))
    setRows(groups);setCursor(null)
   }else{
    const page=await call<Page<Group>>('listGroups',{cursor:next,limit:20})
    setRows(items=>next?[...items,...page.items]:page.items);setCursor(page.nextCursor)
   }
  }catch(e){setError(fail(e))}finally{setLoading(false)}
 },[mine,profile])
 useEffect(()=>{if(!mine||!authLoading)queueMicrotask(()=>void load())},[load,mine,authLoading])
 return <div>
  {error&&<p role="alert">{error} <Button variant="chip" onClick={()=>void load()}>다시 불러오기</Button></p>}
  {loading&&<p role="status">사건을 불러오고 있어요.</p>}
  {!loading&&!error&&!rows.length&&<div className={p.emptyBox}><p className={p.emptyTitle}>{mine?'아직 참여한 사건이 없어요':'아직 개설된 사건이 없어요'}</p><Button href="/report">피해 등록하기</Button></div>}
  <ul>{rows.map(g=><li key={g.id} className={p.dlBox} style={{marginBottom:20,padding:24}}>
   <h2><Link href={mine?routes.groupView(g.id):routes.caseView(g.id)}>{g.name}</Link></h2>
   <p>{g.company} · 개인정보 유출 · {g.memberCount}명 · {phase[g.subStatus]??g.subStatus}</p>
   <p>{g.description}</p>
   <Button href={mine?routes.groupView(g.id):routes.caseView(g.id)} variant="chip">자세히 보기</Button>
  </li>)}</ul>
  {cursor&&<Button disabled={loading} onClick={()=>void load(cursor)}>더 보기</Button>}
 </div>
}
export function GroupDetail({id}:{id:string}){
 const {profile,loading:authLoading}=useSession()
 const [group,setGroup]=useState<Group|null>(null),[member,setMember]=useState<unknown>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [reportId,setReportId]=useState('')
 const load=useCallback(async()=>{
  setError('')
  try{
   const g=await call<Group>('getGroup',{groupId:id});if(!g)throw new Error('사건을 찾을 수 없어요.');setGroup(g)
   const membership=profile?.profile.role==='user'?await call<{leftAt:string|null}|null>('getMyMembership',{groupId:id}):null
   setMember(membership&&membership.leftAt===null?membership:null)
  }catch(e){setError(fail(e))}
 },[id,profile])
 useEffect(()=>{if(!authLoading)queueMicrotask(()=>void load())},[load,authLoading])
 useEffect(()=>{queueMicrotask(()=>setReportId(profile?sessionStorage.getItem(`hande:last-report:${profile.profile.id}`)??'':''))},[profile])
 async function join(){
  if(busy)return;setBusy(true);setError('')
  try{await call('joinGroup',{groupId:id,reportId});await load()}
  catch(e){setError(fail(e))}finally{setBusy(false)}
 }
 return <div className={`${p.page} ${p.narrow}`}>
  <Link href="/cases">사건 목록으로</Link>
  {error&&<p role="alert">{error} <Button variant="chip" onClick={()=>void load()}>새로고침</Button></p>}
  {!group&&!error&&<p>사건을 불러오고 있어요.</p>}
  {group&&<>
   <h1 className={p.title}>{group.name}</h1><p className={p.sub}>{group.description}</p>
   <dl className={`${p.dl} ${p.dlBox}`}>
    {Object.entries({'기업':group.company,'피해 유형':'개인정보 유출','참여 인원':`${group.memberCount}명`,'진행 단계':phase[group.subStatus]??group.subStatus,'참여 조건':group.conditions||'별도 조건 없음'}).map(([label,value])=><div key={label} className={p.dlRow}><dt className={p.dt}>{label}</dt><dd className={p.dd}>{value}</dd></div>)}
   </dl>
   {member?<><p>참여 중인 사건이에요.</p><GroupVoting groupId={id}/>{group.method==='suit'&&<FirmsPanel groupId={id}/>}</>:profile?.profile.role==='user'?<>
    <p>피해 등록에서 확인·저장을 완료한 같은 기업의 사례로 참여할 수 있어요.</p>
    <Button href="/report" variant="chip">내 피해 등록하기</Button>{reportId&&<Button disabled={busy} onClick={()=>void join()}>최근 등록한 피해로 참여하기</Button>}
   </>:<Button href="/login">피해자 로그인 후 참여하기</Button>}
  </>}
 </div>
}

type Vote={pollId:string;kind:string;state:string;opensAt:string;closesAt:string;serverTime:string;myOptionId:string|null;options:{optionId:string;label:string;voteCount:number}[]}
type Notice={groupId:string;type:string;payload:{poll_id?:string;kind?:string}}
function GroupVoting({groupId}:{groupId:string}){
 const [vote,setVote]=useState<Vote|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const [opens,setOpens]=useState(''),[closes,setCloses]=useState(''),[kind,setKind]=useState('representative')
 // 시작 대기 · 투표 중 · 마감 (30초마다 재계산). 투표 버튼은 투표 중에만 눌린다.
 const phase=usePollPhase(vote)
 const load=useCallback(async()=>{
  try{
   let cursor:string|null=null
   do{
    const page:Page<Notice>=await call<Page<Notice>>('listNotifications',{cursor,limit:100})
    // 로펌 투표는 아래 로펌 제안서(FirmsPanel)에서 다룬다
    const notice=page.items.find(n=>n.groupId===groupId&&n.type==='poll_started'&&n.payload.kind!=='firm'&&n.payload.poll_id)
    if(notice){setVote(withClock(await call<Vote>('getVoteSummary',{pollId:notice.payload.poll_id})));return}
    cursor=page.nextCursor
   }while(cursor)
   setVote(null)
  }catch(e){setError(fail(e))}
 },[groupId])
 useEffect(()=>{queueMicrotask(()=>void load())},[load])
 async function run(task:()=>Promise<unknown>){if(busy)return;setBusy(true);setError('');try{await task();await load()}catch(e){setError(fail(e))}finally{setBusy(false)}}
 return <section><h2>투표</h2>{error&&<p role="alert">{error}</p>}
  {vote&&phase?<><PollStatus title={methodLabel[vote.kind]??vote.kind} phase={phase} opensAt={vote.opensAt} closesAt={vote.closesAt}/>
   {['tied','no_votes','cancelled'].includes(vote.state)&&<p>{voteState[vote.state]}</p>}
   {/* 후보 지원은 서버 규칙상 시작 시각 전(시작 대기)에만 가능하다 */}
   {vote.kind==='representative'&&<Button disabled={busy||phase!=='waiting'} variant="chip" onClick={()=>void run(()=>call('applyRepresentative',{pollId:vote.pollId}))}>대표자 후보 지원</Button>}
   <ul>{vote.options.map(option=><li key={option.optionId}>{methodLabel[option.label]??option.label} · {option.voteCount}표 {vote.myOptionId===option.optionId&&'· 내 선택'}
    {vote.kind!=='firm'&&<Button disabled={busy||!canVote(phase)} size="sm" onClick={()=>void run(()=>call(vote.kind==='method'?'castMethodVote':'castRepresentativeVote',vote.kind==='method'?{pollId:vote.pollId,choice:option.label}:{pollId:vote.pollId,optionId:option.optionId}))}>선택하기</Button>}
   </li>)}</ul>
  </>:<p>아직 확인할 투표가 없어요.</p>}
  <Button variant="chip" disabled={busy} onClick={()=>void load()}>투표 새로고침</Button>
  <details><summary>투표 열기</summary><p>대표자 투표는 개설자, 다른 투표는 대표자만 열 수 있어요. 권한·인원·기간은 서버에서 확인합니다.</p>
   <label>투표 종류 <select value={kind} onChange={e=>setKind(e.target.value)}><option value="representative">대표자</option><option value="method">대응 방법</option></select></label>
   <label>시작 <input type="datetime-local" value={opens} onChange={e=>setOpens(e.target.value)}/></label>
   <label>마감 <input type="datetime-local" value={closes} onChange={e=>setCloses(e.target.value)}/></label>
   <Button disabled={busy||!opens||!closes} onClick={()=>void run(()=>call('openPoll',{groupId,kind,opensAt:new Date(opens).toISOString(),closesAt:new Date(closes).toISOString()}))}>투표 열기</Button>
  </details>
 </section>
}
