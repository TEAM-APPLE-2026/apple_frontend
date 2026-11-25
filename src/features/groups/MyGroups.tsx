'use client'

import Link from 'next/link'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import p from '@/components/layout/Page.module.css'
import { useUserState } from '@/features/user/store'
import { MY_GROUPS, type MyGroup } from './data'
import { useGroupState, type Phase } from './store'
import s from './MyGroups.module.css'
import { routes } from '@/lib/routes'

// 대표 예시 그룹은 대시보드 진행 단계에 맞춰 상태 · 할 일이 바뀜
function withPhase(g: MyGroup, phase: Phase, votedMethod: boolean, votedFirm: boolean): MyGroup {
  if (phase === 'method') return votedMethod ? { ...g, todo: '마감까지 기다리기' } : g
  if (phase === 'firm') return { ...g, progress: '공동소송 · 로펌 선택 투표 중', todo: votedFirm ? '마감까지 기다리기' : '로펌 투표하기' }
  return { ...g, badge: { label: '사건 진행 중', tone: 'white' }, progress: '선정 로펌과 진행 중', todo: '로펌 안내 기다리기' }
}

// U-21 내 그룹 · U-22 빈 상태
export default function MyGroups() {
  const { loggedIn, joined } = useUserState()
  const { phase, methodVote, firmVote } = useGroupState()
  const groups = (loggedIn ? MY_GROUPS.filter((g) => joined.includes(g.id)) : []).map((g) =>
    g.id === 'telecom' ? withPhase(g, phase, Boolean(methodVote), Boolean(firmVote)) : g,
  )

  if (groups.length === 0) {
    return (
      <div className={p.emptyBox}>
        <p className={p.emptyTitle}>아직 합류한 사건이 없어요</p>
        <p className={p.emptyDesc}>사건을 둘러보거나, 겪은 일부터 적어 보세요.</p>
        <div className={s.emptyRow}>
          <Button href="/report" size="sm">겪은 일 적기</Button>
          <Button href="/cases" variant="chip" size="sm">사건 둘러보기</Button>
        </div>
      </div>
    )
  }

  return (
    <ul className={s.list}>
      {groups.map((g) => (
        <li key={g.id}>
          <Link href={routes.groupView(g.id)} className={s.card}>
            <span className={s.top}>
              <Badge tone={g.badge.tone}>{g.badge.label}</Badge>
              <span className={s.go}>대시보드 보기 <Icon name="card-arrow" size={16} /></span>
            </span>
            <span className={s.title}>{g.title}</span>
            <span className={s.meta}>{g.meta}{g.metaNote && <small> {g.metaNote}</small>}</span>
            <span className={s.prog}>{g.progress} · <b>할 일: {g.todo}</b></span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
