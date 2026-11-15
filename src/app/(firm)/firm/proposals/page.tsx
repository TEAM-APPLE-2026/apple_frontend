import ProposalList from '@/features/firm/ProposalList'
import s from '@/features/firm/FirmPage.module.css'

// F-08 ~ F-11 내 제안서
export default function FirmProposalsPage() {
  return (
    <div className={`${s.page} ${s.wide}`}>
      <h1 className={s.title}>내 제안서</h1>
      <p className={s.sub}>제출됨 → 피해자 투표 중 → 선정됨 / 선정되지 않음 순서로 바뀝니다.</p>
      <ProposalList />
    </div>
  )
}
