import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Badge from '@/components/common/Badge'
import BackLink from '@/components/common/BackLink'
import CaseActions from '@/features/cases/CaseActions'
import { CASES, STAGES, STATUS, findCase, formatCount } from '@/features/cases/data'
import p from '@/components/layout/Page.module.css'
import s from '@/features/cases/CaseDetail.module.css'

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }))
}

// U-16 ~ U-20 사건 자세히 보기
export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = findCase(id)
  if (!c) notFound()

  const st = STATUS[c.status]
  const closed = c.status === 'closed'
  const sub = c.id === 'telecom' ? '참여하면 내 피해 정보가 이 그룹에 더해져요.' : `${c.stageText}${closed ? ' [예시]' : ''}`
  const deadline = c.deadlineDetail ?? c.deadline
  const ex = <small>[예시]</small>

  const rows: [string, ReactNode][] = [
    ['피해 유형', c.harm],
    ['상태', <Badge key="b" tone={st.tone}>{st.label}</Badge>],
    ['모집 마감', /^\d/.test(deadline) ? <>{deadline} {ex}</> : deadline],
    ['개설일', c.created],
    ['현재 단계', closed ? <>{c.stageText} {ex}</> : c.stageText],
    ['참여 인원', <>{formatCount(c)} <small>[예시 수치]</small></>],
    ['대표자', '선정됨 (참여자 중 자원한 분)'],
    ['공개 범위', '다른 참여자에게는 닉네임 · 피해 정도 · 시기만 보여요'],
  ]

  return (
    <div className={`${p.page} ${p.narrow}`}>
      <div className={p.bar}>
        <p className={p.barLabel}>사건 자세히 보기</p>
        <BackLink href="/cases" label="사건 목록으로" />
      </div>
      <h1 className={p.title}>{c.title}</h1>
      <p className={p.sub}>{sub}</p>

      <ol className={s.stages} aria-label="진행 단계">
        {STAGES.map((label, i) => (
          <li key={label} className={`${s.stage} ${i < st.stage ? s.past : i === st.stage ? s.now : ''}`} aria-current={i === st.stage ? 'step' : undefined}>
            {label}
          </li>
        ))}
      </ol>

      <dl className={`${p.dl} ${p.dlBox}`}>
        {rows.map(([dt, dd]) => (
          <div key={dt} className={`${p.dlRow} ${p.dlCenter}`}>
            <dt className={p.dt}>{dt}</dt>
            <dd className={p.dd}>{dd}</dd>
          </div>
        ))}
      </dl>

      <CaseActions c={c} result={c.result && `${c.result} [예시]`} />
    </div>
  )
}
