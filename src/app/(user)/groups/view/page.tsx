import { Suspense } from 'react'
import GroupView from './GroupView'

// /groups/view?id= — 그룹 대시보드
// useSearchParams를 쓰므로 정적 내보내기(GitHub Pages)를 위해 Suspense로 감싼다
export default function Page() {
  return (
    <Suspense>
      <GroupView />
    </Suspense>
  )
}
