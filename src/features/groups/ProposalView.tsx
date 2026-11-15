'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import p from '@/components/layout/Page.module.css'
import { FIRMS, FIRM_WINNER, GROUP, type FirmId } from './dashboardData'
import { Tag, VoteButton } from './parts'
import { firmVotes, groupActions, useGroupState } from './store'
import s from './Dashboard.module.css'

// U-32 수임 제안서 읽기 (피해자 시점) · U-35 마감 후 (선정 / 선정되지 않음)
export default function ProposalView({ groupId, firmId }: { groupId: string; firmId: FirmId }) {
  const { phase, firmVote, toast } = useGroupState()
  const clear = useCallback(() => groupActions.toast(null), [])
  const f = FIRMS[firmId]
  const closed = phase === 'selected'
  const won = firmId === FIRM_WINNER
  const compareHref = `/groups/${groupId}?tab=firms`

  const rows: [string, string][] = [
    ['착수금', f.fee],
    ['성공보수', f.successFee],
    ['예상 기간', f.period],
    ['담당 변호사', `${f.lawyer} 외 · 총 ${f.lawyers}명`],
  ]

  return (
    <div className={`${p.page} ${p.narrow}`}>
      <div className={p.bar}>
        <Link href={compareHref} className={s.backStrong}><Icon name="back-arrow-strong" size={16} />제안서 비교로</Link>
        <p className={p.barLabel}>로펌 수임 제안서</p>
      </div>
      <h1 className={p.title}>{f.name} 수임 제안서</h1>
      <p className={`${p.sub} ${s.meta}`}>
        <span>{GROUP.title} 그룹에 보낸 제안서 · 제출 {f.submitted}</span>
        {!closed && f.isNew && <Tag>새로 도착</Tag>}
      </p>

      <dl className={`${p.dl} ${p.dlBox}`}>
        {rows.map(([dt, dd]) => (
          <div key={dt} className={p.dlRow}><dt className={p.dt}>{dt}</dt><dd className={p.dd}>{dd}</dd></div>
        ))}
        <div className={p.dlRow}><dt className={p.dt}>대응 전략</dt><dd className={`${p.dd} ${p.ddText}`}>{f.strategy}</dd></div>
      </dl>

      {closed && (
        <section className={`${s.result} ${won ? '' : s.resultMuted}`} aria-label="투표 결과">
          <p className={s.resultLabel}>{won ? '선정' : '선정되지 않음'} · {firmVotes(firmId, firmVote)}표</p>
          <h2 className={s.resultTitle}>선정된 로펌: {FIRMS[FIRM_WINNER].name}</h2>
          <p className={s.resultDesc}>연락처 공개에 동의한 참여자 정보만 선정된 로펌에 전달돼요.</p>
        </section>
      )}

      <div className={`${p.actions} ${closed ? p.actionsStart : ''}`}>
        <Button href={compareHref} variant="chip">다른 제안서와 비교하기</Button>
        {phase === 'firm' && (
          <span className={s.voteInline}>
            <VoteButton voted={firmVote === firmId} onClick={() => groupActions.voteFirm(firmId)}>이 로펌에 투표하기</VoteButton>
          </span>
        )}
      </div>
      <p className={p.lockNote}>
        <Icon name="lock-note" size={16} />
        1인 1표 · 비공개 투표예요. 누가 어디에 투표했는지는 공개되지 않고, 마감 전까지 바꿀 수 있어요. 제안서 내용은 [예시]예요.
      </p>
      <Toast message={toast} onDone={clear} className={s.toast} />
    </div>
  )
}
