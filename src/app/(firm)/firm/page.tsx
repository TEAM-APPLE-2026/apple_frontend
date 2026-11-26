import GroupExplorer, { FirmStatusLine } from '@/features/firm/GroupExplorer'
import s from '@/components/layout/Page.module.css'

// F-01 ~ F-03 사건 탐색 (공동소송 그룹)
export default function FirmExplorePage() {
  return (
    <div className={`${s.page} ${s.wide}`}>
      <h1 className={s.title}>공동소송 그룹</h1>
      <p className={s.sub}>참여자 투표로 공동소송을 정한 그룹입니다. 수임 제안서는 마감 전까지 제출할 수 있습니다.</p>
      <FirmStatusLine />
      <GroupExplorer />
    </div>
  )
}
