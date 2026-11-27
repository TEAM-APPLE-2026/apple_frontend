'use client'

import Button from '@/components/common/Button'
import { acceptsProposals, type FirmGroupRow } from './live'
import s from '@/components/layout/Page.module.css'
import { routes } from '@/lib/routes'

// F-04 page-actions: 제출 여부 · 접수 기간 여부에 따라 주 버튼이 바뀜
export default function GroupActions({ row }: { row: FirmGroupRow }) {
  const { group, mine } = row
  const open = acceptsProposals(group)

  return (
    <div className={s.actions}>
      <Button href="/firm" variant="chip">사건 탐색으로</Button>
      {mine?.status === 'submitted'
        ? <Button href="/firm/proposals">내 제안서 보기</Button>
        : open
          ? <Button href={routes.firmGroupProposal(group.id)}>{mine ? '수임 제안서 다시 제출' : '수임 제안서 작성'}</Button>
          : <Button disabled>{group.subStatus === 'proposal_collection' && !group.proposalDeadline ? '제안 마감일 정해지기 전' : '제안 접수 마감'}</Button>}
    </div>
  )
}
