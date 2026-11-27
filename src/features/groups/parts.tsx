import Link from 'next/link'
import type { ReactNode } from 'react'
import Button from '@/components/common/Button'
import { STAGE_NAMES } from './dashboardData'
import { formatDate, formatDateTime, formatWon, type Proposal } from '@/lib/live-api'
import { PHASE_LABEL, type PollPhase } from './pollPhase'
import s from './Dashboard.module.css'
import { routes } from '@/lib/routes'

// Figma 🧩 Tag — tone: Blue(추천 · 새로 도착) | Neon(투표로 결정 · 선정) | Mine(내 투표)
export function Tag({ tone = 'blue', children }: { tone?: 'blue' | 'neon' | 'mine'; children: string }) {
  return <span className={`${s.tag} ${s[`tag_${tone}`]}`}>{children}</span>
}

// dash-stages: 단계 이름 + 단계별 한 줄
export function Stages({ current, subs }: { current: number; subs: string[] }) {
  return (
    <ol className={s.stages} aria-label="진행 단계">
      {STAGE_NAMES.map((name, i) => (
        <li key={name} className={`${s.stage} ${i < current ? s.past : i === current ? s.now : ''}`} aria-current={i === current ? 'step' : undefined}>
          <span className={s.stageName}>{name}</span>
          <span className={s.stageSub}>{subs[i]}</span>
        </li>
      ))}
    </ol>
  )
}

export function Meter({ value, max, thick }: { value: number; max: number; thick?: boolean }) {
  return (
    <span className={`${s.meter} ${thick ? s.meterThick : ''}`} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span className={s.meterFill} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </span>
  )
}

// Figma 🧩 KPI — trend: Default | Up
export function Kpi({ label, value, unit, caption, up }: { label: string; value: string; unit: string; caption: string; up?: boolean }) {
  return (
    <div className={s.kpi}>
      <p className={s.kpiLabel}>{label}</p>
      <p className={s.kpiValue}><span className="num">{value}</span><small>{unit}</small></p>
      <p className={up ? s.kpiUp : s.kpiCaption}>{caption}</p>
    </div>
  )
}

export function Callout({ label, title, desc, done, children, action }: {
  label: string; title: string; desc: string; done?: boolean; children?: ReactNode; action: ReactNode
}) {
  return (
    <section className={`${s.callout} ${done ? s.calloutDone : ''}`} aria-label={title}>
      <div className={s.calloutBody}>
        <p className={s.calloutLabel}>{label}</p>
        <h2 className={s.calloutTitle}>{title}</h2>
        <p className={s.calloutDesc}>{desc}</p>
        {children}
      </div>
      {action}
    </section>
  )
}

export function KvBox({ rows }: { rows: { label: string; value: ReactNode; tone?: 'neon' | 'danger' }[] }) {
  return (
    <dl className={s.kv}>
      {rows.map((r) => (
        <div key={r.label} className={s.kvRow}>
          <dt>{r.label}</dt>
          <dd className={r.tone ? s[r.tone] : undefined}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Milestones({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <ul className={s.mil}>
      {rows.map((m) => <li key={m.label}><span>{m.label}</span><b>{m.value}</b></li>)}
    </ul>
  )
}

export const proposalHref = (groupId: string, proposalId: string) => routes.groupProposal(groupId, proposalId)

/** 카드·비교표·상세에 쓰는 표시용 값 */
export type CardFirm = { name: string; submitted: string; lawyer: string; fee: string; successFee: string; period: string; lawyers: number; strategy: string }
export const cardOf = (x: Proposal): CardFirm => ({
  name: x.firmName, submitted: formatDate(x.submittedAt), lawyer: x.leadLawyer, fee: formatWon(x.retainerFee),
  successFee: `${x.successFeePct}%`, period: x.period, lawyers: x.lawyerCount, strategy: x.strategy,
})

// pc: 로펌 수임 제안서 카드 (U-30 · U-31 · U-34)
export function ProposalCard({ id, firm, groupId, tags, highlight, footer }: {
  id: string; firm: CardFirm; groupId: string; tags: ReactNode; highlight?: 'blue' | 'neon'; footer: ReactNode
}) {
  return (
    <article className={`${s.pc} ${highlight ? s[`pc_${highlight}`] : ''}`} aria-labelledby={`pc-${id}`}>
      <div className={s.pcHead}>
        <h3 id={`pc-${id}`} className={s.pcName}><Link href={proposalHref(groupId, id)}>{firm.name}</Link></h3>
        {tags}
      </div>
      <p className={s.pcMeta}>제출 {firm.submitted} · 담당 {firm.lawyer}</p>
      <dl className={s.pcNums}>
        <div><dt>착수금</dt><dd>{firm.fee}</dd></div>
        <div><dt>성공보수</dt><dd>{firm.successFee}</dd></div>
        <div><dt>예상 기간</dt><dd>{firm.period}</dd></div>
        <div><dt>담당 변호사</dt><dd>{firm.lawyers}명</dd></div>
      </dl>
      <div className={s.pcStrategy}>
        <p className={s.pcStrategyLabel}>대응 전략</p>
        <p>{firm.strategy}</p>
      </div>
      <div className={s.pcFooter}>{footer}</div>
    </article>
  )
}

/** 투표 버튼을 누를 수 있는지. 모든 투표에서 이 함수 하나로 판단한다(시작 시각 이후 · 마감 시각 이전). */
export const canVote = (phase: PollPhase | null | undefined) => phase === 'open'

// 투표 상태 한 줄: 시작 대기(시작 예정 시각) · 투표 중(마감 시각) · 마감
export function PollStatus({ phase, opensAt, closesAt, title }: { phase: PollPhase; opensAt: string; closesAt: string; title?: string }) {
  const detail = phase === 'waiting' ? `${formatDateTime(opensAt)} 시작 예정 · ${formatDateTime(closesAt)} 마감`
    : phase === 'open' ? `${formatDateTime(closesAt)} 마감` : `${formatDateTime(closesAt)} 마감됨`
  return <p className={s.note} role="status">{title && `${title} · `}<b>{PHASE_LABEL[phase]}</b> · {detail}</p>
}

// 투표 버튼: 투표하면 Pressed(흰색) · 다시 누르면 취소. 추천이 아닌 방법 카드는 Chip.
// fixed: 서버 투표처럼 취소가 없고 다른 선택지를 눌러 바꾸는 경우
// phase를 주면 '투표 중'일 때만 눌린다(시작 대기 · 마감은 비활성화)
export function VoteButton({ voted, onClick, children, chip, fixed, disabled, phase }: {
  voted: boolean; onClick: () => void; children: string; chip?: boolean; fixed?: boolean; disabled?: boolean; phase?: PollPhase | null
}) {
  if (phase !== undefined && !canVote(phase)) {
    return <Button block variant={voted ? 'pressed' : 'chip'} check={voted} disabled aria-pressed={voted}>{phase === 'waiting' ? '투표 시작 전이에요' : '투표가 마감됐어요'}</Button>
  }
  return voted
    ? <Button block variant="pressed" check onClick={onClick} disabled={disabled || fixed} aria-pressed>{fixed ? '투표함 · 다른 로펌을 누르면 바뀌어요' : '투표함 · 다시 누르면 취소'}</Button>
    : <Button block variant={chip ? 'chip' : 'primary'} onClick={onClick} disabled={disabled} aria-pressed={false}>{children}</Button>
}
