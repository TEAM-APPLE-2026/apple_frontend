'use client'

import { useCallback, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge, { type BadgeTone } from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import p from '@/components/layout/Page.module.css'
import { FIRMS, FIRM_IDS, FIRM_WINNER, GROUP, KPIS, METHODS, METHOD_WINNER, MILESTONES, MY_INFO, NOTICE, type FirmId, type MethodId } from './dashboardData'
import { Callout, Kpi, KvBox, Meter, Milestones, ProposalCard, Stages, Tag, VoteButton, proposalHref } from './parts'
import { firmVotes, groupActions, methodVotes, useGroupState, type Phase } from './store'
import s from './Dashboard.module.css'
import { routes } from '@/lib/routes'

type TabId = 'overview' | 'method' | 'firms' | 'news' | 'people'

const PHASE: Record<Phase, { badge: { label: string; tone: BadgeTone }; meta: string; stage: number; subs: string[] }> = {
  method: { badge: { label: '대응 연결 중', tone: 'blue' }, meta: '대응 방법 투표 중', stage: 1, subs: ['대표자 선정됨', '대응 방법 투표 중', '대응 방법 결정 후', '결과 한 줄 표시'] },
  firm: { badge: { label: '대응 연결 중', tone: 'blue' }, meta: '공동소송 · 로펌 선택 투표 중', stage: 1, subs: ['대표자 선정됨', '로펌 선택 투표 중', '대응 방법 결정 후', '결과 한 줄 표시'] },
  selected: { badge: { label: '사건 진행 중', tone: 'white' }, meta: '선정 로펌과 진행 중', stage: 2, subs: ['대표자 선정됨', '로펌 선정 완료', '선정 로펌과 진행 중', '결과 한 줄 표시'] },
}

const pct = (v: number, total: number) => Math.round((v / total) * 100)

// 대시보드 공통 틀: page-bar · 제목 · 단계 · 탭 (U-23 ~ U-38)
export function DashFrame({ title, badge, meta, stage, subs, tabs, tab, onTab, children, onCopy }: {
  title: string; badge: { label: string; tone: BadgeTone }; meta: string[]; stage: number; subs: string[]
  tabs: { id: string; label: string; extra?: ReactNode }[]; tab: string; onTab: (id: string) => void; children: ReactNode; onCopy: () => void
}) {
  return (
    <div className={`${p.page} ${p.wide}`}>
      <div className={p.bar}>
        <Link href="/groups" className={s.backStrong}><Icon name="back-arrow-strong" size={16} />내 그룹</Link>
        <p className={p.barLabel}>그룹 대시보드</p>
      </div>
      <div className={s.head}>
        <div className={s.headTitle}>
          <h1 className={p.title}>{title}</h1>
          <p className={s.meta}><Badge tone={badge.tone}>{badge.label}</Badge>{meta.map((m) => <span key={m}>{m}</span>)}</p>
        </div>
        <Button variant="chip" size="sm" onClick={onCopy}>링크 복사</Button>
      </div>
      <Stages current={stage} subs={subs} />
      <div className={s.tabs} role="tablist" aria-label="대시보드">
        {tabs.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="dash-panel" className={s.tab} onClick={() => onTab(t.id)}>
            {t.label}{t.extra}
          </button>
        ))}
      </div>
      <div id="dash-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className={s.panel}>{children}</div>
    </div>
  )
}

export function useCopyLink(onDone: (msg: string) => void) {
  return useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    onDone('그룹 링크를 복사했어요. 같은 피해를 겪은 사람에게 보내 주세요')
  }, [onDone])
}

// U-23 ~ U-34 대표 예시 그룹 대시보드
export default function GroupDashboard({ groupId }: { groupId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { phase, methodVote, firmVote, toast } = useGroupState()
  const [tab, setTabState] = useState<TabId>(() => (params.get('tab') as TabId) || 'overview')
  const setTab = (t: string) => {
    setTabState(t as TabId)
    router.replace(routes.groupView(groupId, t === 'overview' ? undefined : t), { scroll: false })
  }
  const showToast = useCallback((msg: string | null) => groupActions.toast(msg), [])
  const copy = useCopyLink(showToast)

  const ph = PHASE[phase]
  const tabs = [
    { id: 'overview', label: '현황' },
    { id: 'method', label: '대응 방법' },
    ...(phase !== 'method' ? [{ id: 'firms', label: '로펌 제안서', extra: phase === 'firm' ? <span className={s.cnt}>{FIRM_IDS.length}</span> : undefined }] : []),
    { id: 'news', label: '소식 · 공지' },
    { id: 'people', label: '참여자' },
  ]
  const current = tabs.some((t) => t.id === tab) ? tab : 'overview'

  return (
    <>
      <DashFrame
        title={GROUP.title} badge={ph.badge} meta={[ph.meta, GROUP.leader, GROUP.created]} stage={ph.stage} subs={ph.subs}
        tabs={tabs} tab={current} onTab={setTab} onCopy={copy}
      >
        {current === 'overview' && <Overview phase={phase} methodVote={methodVote} firmVote={firmVote} onTab={setTab} />}
        {current === 'method' && <MethodPanel phase={phase} mine={methodVote} />}
        {current === 'firms' && <FirmsPanel phase={phase} mine={firmVote} groupId={groupId} />}
        {current === 'news' && (
          <article className={s.notice}>
            <h2 className={s.noticeTitle}>{NOTICE.title}</h2>
            <p className={s.noticeMeta}>{NOTICE.meta}</p>
            <p className={s.noticeBody}>{NOTICE.body}</p>
          </article>
        )}
        {current === 'people' && <p className={s.peopleNote}>참여자 목록에는 닉네임 · 피해 정도 · 시기만 보여요. 실명과 연락처는 공개되지 않아요.</p>}
      </DashFrame>

      {phase === 'method' && <button className={s.demo} onClick={() => { groupActions.closeMethodVote(); setTab('overview') }}>[데모] 대응 방법 투표 마감시키기</button>}
      {phase === 'firm' && <button className={s.demo} onClick={() => { groupActions.closeFirmVote(); setTab('overview') }}>[데모] 로펌 투표 마감시키기</button>}
      <Toast message={toast} onDone={() => showToast(null)} className={s.toast} />
    </>
  )
}

function Overview({ phase, methodVote, firmVote, onTab }: { phase: Phase; methodVote: MethodId | null; firmVote: FirmId | null; onTab: (t: string) => void }) {
  const voters = GROUP.voters + (methodVote ? 1 : 0)
  const myRows: { label: string; value: string; tone?: 'neon' | 'danger' }[] = [
    ...MY_INFO,
    methodVote ? { label: '대응 방법 투표', value: `${METHODS[methodVote].voteName}에 투표함`, tone: 'neon' } : { label: '대응 방법 투표', value: phase === 'method' ? '아직 투표하지 않았어요' : '투표하지 않았어요', tone: 'danger' },
    ...(phase !== 'method'
      ? [firmVote ? { label: '로펌 투표', value: `${FIRMS[firmVote].name}에 투표함`, tone: 'neon' as const } : { label: '로펌 투표', value: phase === 'firm' ? '아직 투표하지 않았어요' : '투표하지 않았어요', tone: 'danger' as const }]
      : []),
  ]

  return (
    <>
      {phase === 'method' && (
        <Callout
          label={GROUP.methodDeadline} title="대응 방법을 골라 주세요"
          desc="분쟁조정과 공동소송 중 그룹이 함께 갈 방법을 투표로 정해요. 마감 전까지 바꿀 수 있어요."
          action={<Button arrow onClick={() => onTab('method')}>{methodVote ? '내 투표 보기' : '투표하러 가기'}</Button>}
        >
          <div className={s.turnout}>
            <p>투표 참여 <b>{voters}</b> / {GROUP.members}명</p>
            <Meter value={voters} max={GROUP.members} />
          </div>
        </Callout>
      )}
      {phase === 'firm' && (
        <Callout
          label={`${GROUP.firmDeadline} 마감`} title="로펌을 골라 주세요"
          desc={`대응 방법이 공동소송으로 정해졌어요. 로펌 수임 제안서 ${FIRM_IDS.length}건을 비교하고 투표해 주세요.`}
          action={<Button arrow onClick={() => onTab('firms')}>제안서 비교하기</Button>}
        />
      )}
      {phase === 'selected' && (
        <Callout
          done label="로펌 투표 마감" title={`선정된 로펌: ${FIRMS[FIRM_WINNER].name}`}
          desc="연락처 공개에 동의한 참여자 정보만 이 로펌에 전달돼요. 이후 절차는 로펌과 참여자가 직접 진행해요."
          action={<Button variant="chip" onClick={() => onTab('firms')}>투표 결과 보기</Button>}
        />
      )}

      <div className={s.kpis}>{KPIS.map((k) => <Kpi key={k.label} {...k} />)}</div>
      <p className={s.note}>대시보드의 모든 수치는 <small>[예시 수치]</small>예요.</p>

      <div className={s.cols}>
        <section aria-labelledby="sec-gather">
          <h2 id="sec-gather" className={s.secTitle}>모이고 있어요 · 목표 {GROUP.goal}명</h2>
          <Meter value={GROUP.members} max={GROUP.goal} thick />
          <p className={s.ticks}><span>0</span><span>100</span><span>200</span><span>300명</span></p>
          <Milestones rows={MILESTONES} />
        </section>
        <section aria-labelledby="sec-me">
          <h2 id="sec-me" className={s.secTitle}>내 참여 정보</h2>
          <KvBox rows={myRows} />
        </section>
      </div>
    </>
  )
}

function MethodPanel({ phase, mine }: { phase: Phase; mine: MethodId | null }) {
  const voting = phase === 'method'
  const total = methodVotes('mediation', mine) + methodVotes('lawsuit', mine)

  return (
    <>
      <p className={s.intro}>
        {voting
          ? <>지금 그룹 조건 <b>개인정보 유출 · 참여 {GROUP.members}명</b>에 맞춰 추천한 대응 절차예요. 1인 1표, 비공개 투표이고 마감 전까지 바꿀 수 있어요.</>
          : <>투표가 끝났어요. 그룹은 <b>{METHODS[METHOD_WINNER].voteName}</b>으로 정했어요. 로펌 제안서 탭에서 로펌을 골라 주세요.</>}
      </p>
      <div className={s.methods}>
        {(Object.keys(METHODS) as MethodId[]).map((id) => {
          const m = METHODS[id]
          const v = methodVotes(id, mine)
          const win = !voting && id === METHOD_WINNER
          return (
            <section key={id} className={`${s.method} ${voting && m.recommended ? s.methodRec : ''} ${win ? s.methodWin : ''}`} aria-labelledby={`m-${id}`}>
              <div className={s.methodHead}>
                <h3 id={`m-${id}`} className={s.methodName}>{m.name}</h3>
                {win ? <Tag tone="neon">투표로 결정</Tag> : m.recommended && <Tag>추천</Tag>}
              </div>
              <p className={s.methodDesc}>{m.desc}</p>
              <div className={s.votes}>
                <p><b>{v}</b>표 · {pct(v, total)}%</p>
                <Meter value={v} max={total} />
              </div>
              {voting
                ? <div className={s.methodAction}><VoteButton voted={mine === id} chip={!m.recommended} onClick={() => groupActions.voteMethod(id)}>이 방법에 투표하기</VoteButton></div>
                : mine === id && <p className={s.mine}>내가 투표한 방법이에요</p>}
            </section>
          )
        })}
      </div>
      <p className={s.note}>인원 · 피해 유형 기준의 일반 안내이며 법률 자문이 아니에요. 표 수는 <small>[예시 수치]</small>예요.</p>
    </>
  )
}

function FirmsPanel({ phase, mine, groupId }: { phase: Phase; mine: FirmId | null; groupId: string }) {
  const [open, setOpen] = useState(phase === 'firm' && mine !== null)
  const voting = phase === 'firm'

  return (
    <>
      {voting ? (
        <>
          <p className={s.intro}>
            로펌 <b>{FIRM_IDS.length}곳</b>이 수임 제안서를 보냈어요. 읽어 보고 한 곳에 투표해 주세요. <b>1인 1표 · 비공개</b>이고 {GROUP.firmDeadline}까지 바꿀 수 있어요.
          </p>
          {mine
            ? <p className={`${s.voteStatus} ${s.voteDone}`} role="status"><Icon name="vote-check" size={18} /><span>내 투표: <b>{FIRMS[mine].name}</b> · 마감 전까지 바꿀 수 있어요</span></p>
            : <p className={`${s.voteStatus} ${s.voteTodo}`} role="status"><Icon name="vote-alert" size={18} />아직 투표하지 않았어요</p>}
        </>
      ) : (
        <>
          <p className={s.intro}>로펌 투표가 마감됐어요.</p>
          <section className={s.result} aria-label="투표 결과">
            <p className={s.resultLabel}>투표 결과</p>
            <h2 className={s.resultTitle}>선정된 로펌: {FIRMS[FIRM_WINNER].name}</h2>
            <p className={s.resultDesc}>연락처 공개에 동의한 참여자 정보만 이 로펌에 전달돼요. 이후 절차는 로펌과 참여자가 직접 진행해요.</p>
          </section>
        </>
      )}

      <div className={s.pcGrid}>
        {FIRM_IDS.map((id) => {
          const f = FIRMS[id]
          const win = !voting && id === FIRM_WINNER
          const tags = (
            <span>
              {mine === id && <Tag tone="mine">내 투표</Tag>}
              {win && <Tag tone="neon">선정</Tag>}
              {voting && f.isNew && mine !== id && <Tag>새로 도착</Tag>}
            </span>
          )
          const v = firmVotes(id, mine)
          return (
            <ProposalCard
              key={id} id={id} firm={f} groupId={groupId} tags={tags}
              highlight={voting && mine === id ? 'blue' : win ? 'neon' : undefined}
              footer={voting
                ? <VoteButton voted={mine === id} onClick={() => groupActions.voteFirm(id)}>이 로펌에 투표하기</VoteButton>
                : win ? <p className={s.pcVotesWin}><b>{v}표</b> · 선정</p> : <p className={s.pcVotes}>{v}표</p>}
            />
          )
        })}
      </div>

      <div className={s.compare}>
        <button className={s.summary} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="compare-table">
          <Icon name={open ? 'compare-chevron' : 'compare-arrow'} size={14} />한눈에 비교하기 (표)
        </button>
        {open && (
          <div className={s.cmpWrap} id="compare-table">
            <table className={s.cmp}>
              <thead>
                <tr>
                  <td />
                  {FIRM_IDS.map((id) => (
                    <th key={id} scope="col">
                      <span className={s.cmpFirm}>{FIRMS[id].name}{voting && FIRMS[id].isNew && <Tag>새로 도착</Tag>}</span>
                      <Link href={proposalHref(groupId, id)} className={s.cmpRead}>제안서 읽기</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([['착수금', 'fee'], ['성공보수', 'successFee'], ['예상 기간', 'period'], ['대응 전략', 'strategy']] as const).map(([label, key]) => (
                  <tr key={key}><th scope="row">{label}</th>{FIRM_IDS.map((id) => <td key={id}>{FIRMS[id][key]}</td>)}</tr>
                ))}
                <tr><th scope="row">담당 변호사</th>{FIRM_IDS.map((id) => <td key={id}>{FIRMS[id].lawyers}명</td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className={s.note}>제안서 내용과 표 수는 <small>[예시]</small>예요. 누가 어디에 투표했는지는 공개되지 않아요.</p>
    </>
  )
}
