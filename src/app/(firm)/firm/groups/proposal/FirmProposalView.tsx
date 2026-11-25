'use client'

import { notFound, useSearchParams } from 'next/navigation'
import BackLink from '@/components/common/BackLink'
import ProposalForm from '@/features/firm/ProposalForm'
import { findGroup } from '@/features/firm/data'
import s from '@/components/layout/Page.module.css'

// F-05 수임 제안서 작성 · F-06 입력 확인 필요 · F-07 제출 전 확인 (/firm/groups/proposal?id=)
export default function FirmProposalView() {
  const id = useSearchParams().get('id') ?? ''
  const g = findGroup(id)
  if (!g) notFound()

  return (
    <div className={`${s.page} ${s.narrow}`}>
      <div className={s.bar}>
        <p className={s.barLabel}>수임 제안서 작성</p>
        <BackLink href="/firm" label="사건 탐색" />
      </div>
      <h1 className={s.title}>수임 제안서 작성</h1>
      <p className={s.sub}>{g.title} 그룹에 보내는 수임 제안서입니다. 제출하면 피해자 투표로 선택됩니다.</p>
      <ProposalForm groupId={g.id} />
    </div>
  )
}
