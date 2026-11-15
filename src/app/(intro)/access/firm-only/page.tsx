import AccessNotice from '@/features/auth/AccessNotice'
import { currentUser } from '@/lib/mock'

// I-12 접근 안내 · 로펌 전용 (일반 사용자 계정으로 들어온 경우)
export default function FirmOnlyPage() {
  return (
    <AccessNotice
      title="로펌 전용 화면이에요"
      back={{ href: '/groups', label: '내 그룹으로' }}
      primary={{ href: '/login/firm', label: '로그아웃하고 로펌 로그인' }}
    >
      지금 {currentUser.nickname} 님(일반 사용자)으로 로그인되어 있어요. 이 화면은 사업자 확인을 마친 로펌만 볼 수 있어요.
    </AccessNotice>
  )
}
