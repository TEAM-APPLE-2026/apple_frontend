'use client'

import { useSearchParams } from 'next/navigation'
import ProposalView from '@/features/groups/ProposalView'
import { isUuid } from '@/lib/routes'

// U-32 · U-35 로펌 수임 제안서 읽기 (피해자 시점) (/groups/proposal?id=&proposalId=)
export default function GroupProposalView() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const proposalId = params.get('proposalId') ?? ''
  if (!isUuid(id) || !isUuid(proposalId)) return <p>올바른 제안서 주소로 접속해 주세요.</p>
  return <ProposalView groupId={id} proposalId={proposalId} />
}
