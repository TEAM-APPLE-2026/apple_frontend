import { Suspense } from 'react'
import CaseList from '@/features/cases/CaseList'
import s from '@/components/layout/Page.module.css'

// U-13 ~ U-15 사건 둘러보기 (상단 검색창 → ?q=)
export default function CasesPage() {
  return (
    <div className={`${s.page} ${s.wide}`}>
      <h1 className={s.title}>사건 둘러보기</h1>
      <p className={s.sub}>지금 HANDE에 모이고 있는 사건이에요. 로그인하지 않아도 볼 수 있어요.</p>
      <Suspense>
        <CaseList />
      </Suspense>
    </div>
  )
}
