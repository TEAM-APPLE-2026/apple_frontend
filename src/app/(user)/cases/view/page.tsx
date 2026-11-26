import { Suspense } from 'react'
import CaseView from './CaseView'

// /cases/view?id= — 사건 자세히 보기
// useSearchParams를 쓰므로 정적 내보내기(GitHub Pages)를 위해 Suspense로 감싼다
export default function Page() {
  return (
    <Suspense>
      <CaseView />
    </Suspense>
  )
}
