'use client'

import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import BackLink from '@/components/common/BackLink'
import Icon from '@/components/common/Icon'
import GroupActions from '@/features/firm/GroupActions'
import { pct, useFirmGroup } from '@/features/firm/live'
import { formatDateTime } from '@/lib/live-api'
import { isUuid } from '@/lib/routes'
import s from '@/components/layout/Page.module.css'

// F-04 그룹 보기 · 익명 집계 (/firm/groups/view?id=)
export default function FirmGroupView() {
  const id = useSearchParams().get('id') ?? ''
  if (!isUuid(id)) return <p>올바른 그룹 주소로 접속해 주세요.</p>
  return <Loaded id={id} />
}

function Loaded({ id }: { id: string }) {
  const { row, error } = useFirmGroup(id)
  const g = row?.group
  const st = row?.stats
  const secondary = pct(st?.secondaryRatio ?? null)
  const evidence = pct(st?.evidenceRatio ?? null)

  const rows: [string, ReactNode][] = g ? [
    ['참여 인원', `${g.memberCount.toLocaleString()}명`],
    ['피해 유형', '개인정보 유출 100%'],
    ['2차 피해 비율', st ? (secondary === null ? '응답 없음' : `${secondary}% (${st.secondaryYesCount.toLocaleString()}명)`) : '승인된 로펌에게만 보입니다'],
    ['증거 보유율', st ? (evidence === null ? '-' : `${evidence}% (${st.evidenceHolderCount.toLocaleString()}명)`) : '승인된 로펌에게만 보입니다'],
    ['제안 마감', formatDateTime(g.proposalDeadline)],
  ] : []

  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}>그룹 보기 · 익명 집계</p>
        <BackLink href="/firm" label="사건 탐색" />
      </div>
      {error && <p role="alert" className={s.note}>{error}</p>}
      {!row && !error && <p role="status">그룹 정보를 불러오고 있습니다.</p>}
      {g && row && (
        <>
          <h1 className={s.title}>{g.name}</h1>
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
          <GroupActions row={row} />
        </>
      )}
    </div>
  )
}
