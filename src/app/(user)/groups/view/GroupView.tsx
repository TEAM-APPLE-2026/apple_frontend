'use client'

import { notFound, useSearchParams } from 'next/navigation'
import GroupDashboard from '@/features/groups/GroupDashboard'
import NewGroupDashboard from '@/features/groups/NewGroupDashboard'

// U-23 ~ U-34 그룹 대시보드 (대표 예시) · U-36 ~ U-38 새 그룹 대시보드 (/groups/view?id=)
// Suspense는 page.tsx에서 감싼다
export default function GroupView() {
  const id = useSearchParams().get('id') ?? ''
  if (id === 'new') return <NewGroupDashboard />
  if (id !== 'telecom') notFound()
  return <GroupDashboard groupId={id} />
}
