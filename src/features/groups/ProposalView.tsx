'use client'

import Link from 'next/link'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import p from '@/components/layout/Page.module.css'
import { call } from '@/lib/live-api'
import { VoteButton, cardOf } from './parts'
import { optionOf, useFirmVote, winnerProposalId } from './firmVote'
import { useRunner } from './FirmsPanel'
import s from './Dashboard.module.css'
import { routes } from '@/lib/routes'

// U-32 수임 제안서 읽기 (피해자 시점) · U-35 마감 후 (선정 / 선정되지 않음)
export default function ProposalView({ groupId, proposalId }: { groupId: string; proposalId: string }) {
  const { data, error: loadError, reload } = useFirmVote(groupId)
  const runner = useRunner(reload)
  const compareHref = routes.groupView(groupId, 'firms')
  const back = (
    <div className={p.bar}>
      <Link href={compareHref} className={s.backStrong}><Icon name="back-arrow-strong" size={16} />제안서 비교로</Link>
      <p className={p.barLabel}>로펌 수임 제안서</p>
    </div>
  )

  if (loadError || !data) {
    return <div className={`${p.page} ${p.narrow}`}>{back}<p role={loadError ? 'alert' : 'status'}>{loadError || '제안서를 불러오고 있어요.'}</p></div>
  }
  const { group, proposals, vote, stage, membership } = data
  const x = proposals.find((item) => item.id === proposalId)
  if (!membership || !x) {
    return (
      <div className={`${p.page} ${p.narrow}`}>{back}
        <p>{membership ? '제안서를 찾을 수 없어요. 철회됐거나 다른 그룹의 제안서예요.' : '그룹 참여자만 제안서를 볼 수 있어요.'}</p>
        <Button href={compareHref} variant="chip">그룹으로 돌아가기</Button>
      </div>
    )
  }

  const f = cardOf(x)
  const closed = stage === 'selected'
  const winner = winnerProposalId(vote)
  const won = x.id === winner
  const option = optionOf(vote, x.id)
  const voted = !!option && vote?.myOptionId === option.optionId
  const rows: [string, string][] = [
    ['착수금', f.fee],
    ['성공보수', f.successFee],
    ['예상 기간', f.period],
    ['담당 변호사', f.lawyers > 1 ? `${f.lawyer} 외 · 총 ${f.lawyers}명` : f.lawyer],
  ]

  return (
    <div className={`${p.page} ${p.narrow}`}>
      {back}
      <h1 className={p.title}>{f.name} 수임 제안서</h1>
      <p className={`${p.sub} ${s.meta}`}>
        <span>{group.name} 그룹에 보낸 제안서 · 제출 {f.submitted}</span>
      </p>

      <dl className={`${p.dl} ${p.dlBox}`}>
        {rows.map(([dt, dd]) => (
          <div key={dt} className={p.dlRow}><dt className={p.dt}>{dt}</dt><dd className={p.dd}>{dd}</dd></div>
        ))}
        <div className={p.dlRow}><dt className={p.dt}>대응 전략</dt><dd className={`${p.dd} ${p.ddText}`}>{f.strategy}</dd></div>
      </dl>

      {closed && (
        <section className={`${s.result} ${won ? '' : s.resultMuted}`} aria-label="투표 결과">
          <p className={s.resultLabel}>{won ? '선정' : '선정되지 않음'}{option ? ` · ${option.voteCount}표` : ''}</p>
          <h2 className={s.resultTitle}>선정된 로펌: {group.selectedFirmName ?? proposals.find((item) => item.id === winner)?.firmName ?? '확인 중'}</h2>
          <p className={s.resultDesc}>연락처 공개에 동의한 참여자 정보만 선정된 로펌에 전달돼요.</p>
        </section>
      )}
      {runner.error && <p role="alert" className={p.note}>{runner.error}</p>}

      <div className={`${p.actions} ${closed ? p.actionsStart : ''}`}>
        <Button href={compareHref} variant="chip">다른 제안서와 비교하기</Button>
        {stage === 'voting' && vote && option && (
          <span className={s.voteInline}>
            <VoteButton fixed voted={voted} disabled={runner.busy} onClick={() => void runner.run('vote',
              () => call('castFirmVote', { pollId: vote.pollId, proposalId: x.id }), '투표했어요. 마감 전까지 다른 로펌으로 바꿀 수 있어요')}>이 로펌에 투표하기</VoteButton>
          </span>
        )}
      </div>
      <p className={p.lockNote}>
        <Icon name="lock-note" size={16} />
        1인 1표 · 비공개 투표예요. 누가 어디에 투표했는지는 공개되지 않고, 마감 전까지 다른 로펌으로 바꿀 수 있어요.
      </p>
      <Toast message={runner.toast} onDone={() => runner.setToast(null)} className={s.toast} />
    </div>
  )
}
