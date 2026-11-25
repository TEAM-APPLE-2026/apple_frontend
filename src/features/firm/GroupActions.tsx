'use client'

import Button from '@/components/common/Button'
import { useFirmState } from './store'
import s from '@/components/layout/Page.module.css'
import { routes } from '@/lib/routes'

// F-04 page-actions: 제출 여부 · 공동소송 확정 여부에 따라 주 버튼이 바뀜
export default function GroupActions({ groupId }: { groupId: string }) {
  const { lawsuitGroups, proposals } = useFirmState()
  const submitted = proposals.some((p) => p.groupId === groupId)
  const isLawsuit = lawsuitGroups.includes(groupId)

  return (
    <div className={s.actions}>
      <Button href="/firm" variant="chip">사건 탐색으로</Button>
      {submitted
        ? <Button href="/firm/proposals">내 제안서 보기</Button>
        : isLawsuit
          ? <Button href={routes.firmGroupProposal(groupId)}>수임 제안서 작성</Button>
          : <Button disabled>대응 방법 투표 중</Button>}
    </div>
  )
}
