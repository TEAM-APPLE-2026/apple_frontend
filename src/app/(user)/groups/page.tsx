import MyGroups from '@/features/groups/MyGroups'
import s from '@/components/layout/Page.module.css'

// U-21 내 그룹 · U-22 빈 상태
export default function GroupsPage() {
  return (
    <div className={`${s.page} ${s.narrow}`}>
      <h1 className={s.title}>내 그룹</h1>
      <p className={s.sub}>그룹을 누르면 그 그룹의 대시보드로 가요.</p>
      <MyGroups />
    </div>
  )
}
