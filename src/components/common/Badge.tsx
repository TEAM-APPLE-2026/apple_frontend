import s from './Badge.module.css'

// Figma 🧩 Badge — tone: Blue | Line | White
export type BadgeTone = 'blue' | 'line' | 'white'

export default function Badge({ tone = 'blue', children }: { tone?: BadgeTone; children: string }) {
  return <span className={`${s.badge} ${s[tone]}`}>{children}</span>
}
