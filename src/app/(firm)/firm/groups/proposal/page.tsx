import { Suspense } from 'react'
import FirmProposalView from './FirmProposalView'

// /firm/groups/proposal?id= — 로펌: 수임 제안서 작성
// useSearchParams를 쓰므로 정적 내보내기(GitHub Pages)를 위해 Suspense로 감싼다
export default function Page() {
  return (
    <Suspense>
      <FirmProposalView />
    </Suspense>
  )
}
