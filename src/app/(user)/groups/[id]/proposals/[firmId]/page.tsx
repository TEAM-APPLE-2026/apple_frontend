import { notFound } from 'next/navigation'
import ProposalView from '@/features/groups/ProposalView'
import { FIRM_IDS, type FirmId } from '@/features/groups/dashboardData'

export function generateStaticParams() {
  return FIRM_IDS.map((firmId) => ({ id: 'telecom', firmId }))
}

// U-32 · U-35 로펌 수임 제안서 읽기 (피해자 시점)
export default async function ProposalPage({ params }: { params: Promise<{ id: string; firmId: string }> }) {
  const { id, firmId } = await params
  if (id !== 'telecom' || !FIRM_IDS.includes(firmId as FirmId)) notFound()
  return <ProposalView groupId={id} firmId={firmId as FirmId} />
}
