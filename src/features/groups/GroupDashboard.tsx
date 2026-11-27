'use client'

import { useCallback, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge, { type BadgeTone } from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import p from '@/components/layout/Page.module.css'
import { GROUP, KPIS, METHODS, METHOD_WINNER, MILESTONES, MY_INFO, NOTICE, type MethodId } from './dashboardData'
import { Callout, Kpi, KvBox, Meter, Milestones, Stages, Tag, VoteButton } from './parts'
import { groupActions, methodVotes, useGroupState, type Phase } from './store'
import s from './Dashboard.module.css'
import { routes } from '@/lib/routes'

type TabId = 'overview' | 'method' | 'news' | 'people'

const PHASE: Record<Phase, { badge: { label: string; tone: BadgeTone }; meta: string; stage: number; subs: string[] }> = {
  method: { badge: { label: '대응 연결 중', tone: 'blue' }, meta: '대응 방법 투표 중', stage: 1, subs: ['대표자 선정됨', '대응 방법 투표 중', '대응 방법 결정 후', '결과 한 줄 표시'] },
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

// U-23 ~ U-29 대표 예시 그룹 대시보드 (시연용, 현재 라우트에 연결되지 않음)
// 로펌 제안서 탭(U-30 ~ U-35)은 실제 데이터 화면 FirmsPanel.tsx로 옮겼다.
export default function GroupDashboard({ groupId }: { groupId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { phase, methodVote, toast } = useGroupState()
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
        {current === 'overview' && <Overview phase={phase} methodVote={methodVote} onTab={setTab} />}
        {current === 'method' && <MethodPanel phase={phase} mine={methodVote} />}
        {current === 'news' && (
          <article className={s.notice}>
            <h2 className={s.noticeTitle}>{NOTICE.title}</h2>
            <p className={s.noticeMeta}>{NOTICE.meta}</p>
            <p className={s.noticeBody}>{NOTICE.body}</p>
          </article>
        )}
        {current === 'people' && <p className={s.peopleNote}>참여자 목록에는 닉네임 · 피해 정도 · 시기만 보여요. 실명과 연락처는 공개되지 않아요.</p>}
      </DashFrame>

      <Toast message={toast} onDone={() => showToast(null)} className={s.toast} />
    </>
  )
}

function Overview({ phase, methodVote, onTab }: { phase: Phase; methodVote: MethodId | null; onTab: (t: string) => void }) {
  const voters = GROUP.voters + (methodVote ? 1 : 0)
  const myRows: { label: string; value: string; tone?: 'neon' | 'danger' }[] = [
    ...MY_INFO,
    methodVote ? { label: '대응 방법 투표', value: `${METHODS[methodVote].voteName}에 투표함`, tone: 'neon' } : { label: '대응 방법 투표', value: phase === 'method' ? '아직 투표하지 않았어요' : '투표하지 않았어요', tone: 'danger' },
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
