'use client'

import { useSearchParams } from 'next/navigation'
import BackLink from '@/components/common/BackLink'
import ProposalForm from '@/features/firm/ProposalForm'
import { acceptsProposals, useFirmGroup } from '@/features/firm/live'
import { formatDateTime } from '@/lib/live-api'
import { isUuid } from '@/lib/routes'
import s from '@/components/layout/Page.module.css'

// F-05 수임 제안서 작성 · F-06 입력 확인 필요 · F-07 제출 전 확인 (/firm/groups/proposal?id=)
export default function FirmProposalView() {
  const id = useSearchParams().get('id') ?? ''
  if (!isUuid(id)) return <p>올바른 그룹 주소로 접속해 주세요.</p>
  return <Loaded id={id} />
}

function Loaded({ id }: { id: string }) {
  const { row, error, reload } = useFirmGroup(id)
  const g = row?.group

  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}>수임 제안서 작성</p>
        <BackLink href="/firm" label="사건 탐색" />
      </div>
      <h1 className={s.title}>수임 제안서 {row?.mine ? '수정' : '작성'}</h1>
      {error && <p role="alert" className={s.note}>{error}</p>}
      {!row && !error && <p role="status">그룹 정보를 불러오고 있습니다.</p>}
      {g && row && (
        <>
          <p className={s.sub}>{g.name} 그룹에 보내는 수임 제안서입니다. 제안 마감 {formatDateTime(g.proposalDeadline)} · 제출하면 피해자 투표로 선택됩니다.</p>
          {/* 불러온 제안서가 바뀌면 입력값을 새로 채우도록 key를 준다 */}
          <ProposalForm key={row.mine?.updatedAt ?? 'new'} groupId={g.id} existing={row.mine} canEdit={acceptsProposals(g)} onChanged={reload} />
        </>
      )}
    </div>
  )
}
