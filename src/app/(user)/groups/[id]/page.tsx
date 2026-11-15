import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import GroupDashboard from '@/features/groups/GroupDashboard'
import NewGroupDashboard from '@/features/groups/NewGroupDashboard'

export function generateStaticParams() {
  return [{ id: 'telecom' }, { id: 'new' }]
}

// U-23 ~ U-34 그룹 대시보드 (대표 예시) · U-36 ~ U-38 새 그룹 대시보드
export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') return <NewGroupDashboard />
  if (id !== 'telecom') notFound()
  return (
    <Suspense>
      <GroupDashboard groupId={id} />
    </Suspense>
  )
}
