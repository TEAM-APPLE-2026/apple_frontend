import s from './Badge.module.css'

// Figma 🧩 Badge — tone: Blue | Line | White | Dim
export type BadgeTone = 'blue' | 'line' | 'white' | 'dim'

export default function Badge({ tone = 'blue', children }: { tone?: BadgeTone; children: string }) {
  return <span className={`${s.badge} ${s[tone]}`}>{children}</span>
}
