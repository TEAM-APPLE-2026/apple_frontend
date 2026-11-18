import { Suspense } from 'react'
import CaseList from '@/features/cases/CaseList'
import s from '@/features/cases/CaseList.module.css'

// U-13 ~ U-15 사건 둘러보기 (상단 검색창 → ?q=)
// 소개 홈(I-01)과 같은 톤: 검은 배경 · eyebrow + 두 줄 제목 · 투명 카드
export default function CasesPage() {
  return (
    <div className={s.bleed}>
      <div className={s.page}>
        <p className={s.eyebrow}>사건</p>
        <h1 className={s.h1}>
          <span className={s.h1Strong}>사건</span>{' '}
          <span className={s.h1Light}>둘러보기</span>
        </h1>
        <p className={s.lead}>지금 HANDE에 모이고 있는 사건이에요. 로그인하지 않아도 볼 수 있어요.</p>
        <Suspense>
          <CaseList />
        </Suspense>
      </div>
    </div>
  )
}
