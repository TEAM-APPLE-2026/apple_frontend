import AccessNotice from '@/features/auth/AccessNotice'

// I-11 접근 안내 · 일반 사용자 전용 (로펌 계정으로 들어온 경우)
export default function UserOnlyPage() {
  return (
    <AccessNotice
      title="일반 사용자 전용 화면입니다"
      back={{ href: '/firm', label: '로펌 화면으로' }}
      primary={{ href: '/login', label: '로그아웃하고 일반 사용자 로그인' }}
    >
      지금 [예시] 마 법무법인(로펌)으로 로그인되어 있습니다. 피해 등록 · 투표 화면은 일반 사용자만 볼 수 있습니다.
    </AccessNotice>
  )
}
