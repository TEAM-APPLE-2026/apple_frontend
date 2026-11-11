// Figma 🧩 Components > Icons (24px 원본). public/icons/*.svg 로 서빙.
export type IconName =
  | 'arrow' | 'arrow-left' | 'arrow-down' | 'check' | 'plus' | 'x' | 'menu' | 'search'
  | 'home' | 'edit' | 'users' | 'file' | 'scale' | 'building' | 'clock' | 'alert' | 'lock' | 'chevron-down'
  // 컴포넌트 전용 변형 (크기·색이 다른 Figma 원본)
  | 'nav-home' | 'nav-edit' | 'nav-search' | 'nav-users' | 'searchbox-search'
  | 'btn-arrow' | 'btn-arrow-dark' | 'btn-check' | 'btn-check-dark'
  | 'back-arrow' | 'back-arrow-strong' | 'checkbox-check'

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
