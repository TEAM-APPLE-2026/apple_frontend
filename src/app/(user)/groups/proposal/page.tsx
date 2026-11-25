import { Suspense } from 'react'
import GroupProposalView from './GroupProposalView'

// /groups/proposal?id=&firmId= — 로펌 수임 제안서 읽기
// useSearchParams를 쓰므로 정적 내보내기(GitHub Pages)를 위해 Suspense로 감싼다
export default function Page() {
  return (
    <Suspense>
      <GroupProposalView />
    </Suspense>
  )
}
