'use client'

import { notFound, useSearchParams } from 'next/navigation'
import ProposalView from '@/features/groups/ProposalView'
import { FIRM_IDS, type FirmId } from '@/features/groups/dashboardData'

// U-32 · U-35 로펌 수임 제안서 읽기 (피해자 시점) (/groups/proposal?id=&firmId=)
export default function GroupProposalView() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const firmId = params.get('firmId') ?? ''
  if (id !== 'telecom' || !FIRM_IDS.includes(firmId as FirmId)) notFound()
  return <ProposalView groupId={id} firmId={firmId as FirmId} />
}
