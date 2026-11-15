import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import BackLink from '@/components/common/BackLink'
import Icon from '@/components/common/Icon'
import GroupActions from '@/features/firm/GroupActions'
import { FIRM_GROUPS, findGroup, formatDeadline } from '@/features/firm/data'
import s from '@/components/layout/Page.module.css'

export function generateStaticParams() {
  return FIRM_GROUPS.map((g) => ({ id: g.id }))
}

// F-04 그룹 보기 · 익명 집계
export default async function FirmGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = findGroup(id)
  if (!g) notFound()

  const rows: [string, ReactNode][] = [
    ['참여 인원', <>{g.members.toLocaleString()}명 <small>[예시 수치]</small></>],
    ['피해 유형', `${g.harm} 100%`],
    ['2차 피해 비율', `${Math.round((g.secondary / g.members) * 100)}% (${g.secondary.toLocaleString()}명)`],
    ['증거 보유율', `${g.evidence}%`],
    ['공동소송 득표', `${g.share}%`],
    ['제안 마감', formatDeadline(g.deadline)],
  ]

  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}>그룹 보기 · 익명 집계</p>
        <BackLink href="/firm" label="사건 탐색" />
      </div>
      <h1 className={s.title}>{g.title}</h1>
      <dl className={`${s.dl} ${s.dlBox}`}>
        {rows.map(([dt, dd]) => (
          <div key={dt} className={s.dlRow}>
            <dt className={s.dt}>{dt}</dt>
            <dd className={s.dd}>{dd}</dd>
          </div>
        ))}
      </dl>
      <p className={s.lockNote}>
        <Icon name="lock-note" size={16} />
        개인 실명 · 연락처는 보이지 않습니다. 선정된 뒤 연락처 공개에 동의한 참여자 정보만 전달됩니다.
      </p>
      <GroupActions groupId={g.id} />
    </div>
  )
}
