// Figma 🧩 Components > Icons (24px 원본). public/icons/*.svg 로 서빙.
export type IconName =
  | 'arrow' | 'arrow-left' | 'arrow-down' | 'check' | 'plus' | 'x' | 'menu' | 'search'
  | 'home' | 'edit' | 'users' | 'file' | 'scale' | 'building' | 'clock' | 'alert' | 'lock' | 'chevron-down'
  // 컴포넌트 전용 변형 (크기·색이 다른 Figma 원본)
  | 'nav-home' | 'nav-edit' | 'nav-search' | 'nav-users' | 'searchbox-search'
  | 'btn-arrow' | 'btn-arrow-dark' | 'btn-check' | 'btn-check-dark'
  | 'back-arrow' | 'back-arrow-strong' | 'checkbox-check'
  // 소개 · 로그인 화면 (Figma 01 소개 · 로그인)
  | 'role-arrow' | 'card-arrow' | 'more-arrow' | 'faq-x' | 'menu-x'
  | 'tl-clock' | 'tl-edit' | 'tl-users'
  // 로펌 화면 (Figma 03 로펌) — 사이드바는 비활성/활성(-on) 원본이 따로 있음
  | 'firm-scale' | 'status-check' | 'lock-note'
  | 'fnav-search' | 'fnav-search-on' | 'fnav-file' | 'fnav-file-on'
  | 'fnav-scale' | 'fnav-scale-on' | 'fnav-building' | 'fnav-building-on'

type Props = { name: IconName; size?: number; className?: string }

export default function Icon({ name, size = 24, className }: Props) {
  return (
    <img
      src={`/icons/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={className}
      style={{ flexShrink: 0 }}
    />
  )
}
