'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import { call, friendlyError, formatDateTime, type Action } from '@/lib/live-api'
import { PollStatus, ProposalCard, Tag, VoteButton, cardOf, proposalHref } from './parts'
import { RETRY_TEXT, optionOf, useFirmStage, useFirmVote, winnerProposalId, type FirmVoteData } from './firmVote'
import s from './Dashboard.module.css'

const VOTED = '투표했어요. 마감 전까지 다른 로펌으로 바꿀 수 있어요'

/** 투표·마감일·투표 열기 공통 실행: 실패하면 쉬운 말로 안내하고, 끝나면 다시 불러온다 */
export function useRunner(reload: () => Promise<void>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const run = async (action: Action, task: () => Promise<unknown>, done?: string) => {
    if (busy) return
    setBusy(true); setError('')
    try { await task(); if (done) setToast(done) } catch (e) { setError(friendlyError(e, action)) } finally { setBusy(false); await reload() }
  }
  return { busy, error, toast, setToast, run }
}

// U-30 · U-31 · U-34 로펌 제안서 탭 (실제 데이터). 그룹 상세의 참여자 화면에서 쓴다.
export default function FirmsPanel({ groupId }: { groupId: string }) {
  const { data, error: loadError, reload } = useFirmVote(groupId)
  const runner = useRunner(reload)
  const [open, setOpen] = useState(false)

  if (loadError) return <p role="alert">{loadError} <Button variant="chip" size="sm" onClick={() => void reload()}>다시 불러오기</Button></p>
  if (!data) return <p role="status">로펌 제안서를 불러오고 있어요.</p>
  if (data.stage === 'not_suit' || !data.membership) return null

  return (
    <section aria-labelledby="firms-title">
      <h2 id="firms-title" className={s.secTitle}>로펌 제안서</h2>
      <Body data={data} runner={runner} open={open} setOpen={setOpen} />
      <Toast message={runner.toast} onDone={() => runner.setToast(null)} className={s.toast} />
    </section>
  )
}

function Body({ data, runner, open, setOpen }: { data: FirmVoteData; runner: ReturnType<typeof useRunner>; open: boolean; setOpen: (f: (o: boolean) => boolean) => void }) {
  const { group, proposals, vote, membership } = data
  // 시작 대기 · 투표 중 · 집계 대기는 30초마다 다시 계산된다
  const { stage, phase } = useFirmStage(data)
  const groupId = group.id
  const voting = stage === 'voting'
  // 투표가 열린 뒤(시작 대기 포함)에는 카드에 투표 버튼을 두고, 누를 수 있는지는 phase로 정한다
  const ballot = (voting || stage === 'waiting') && !!vote
  const winner = winnerProposalId(vote)
  const mine = vote?.myOptionId ? vote.options.find((o) => o.optionId === vote.myOptionId)?.proposalId ?? null : null
  // 투표가 열렸으면 선택지에 오른 제안서만, 아니면 제출된 제안서 전체를 보여 준다
  const shown = vote ? proposals.filter((x) => optionOf(vote, x.id)) : proposals
  const castVote = (proposalId: string) =>
    runner.run('vote', () => call('castFirmVote', { pollId: vote!.pollId, proposalId }), VOTED)

  return (
    <>
      {runner.error && <p role="alert" className={s.note}>{runner.error}</p>}

      {stage === 'collecting' && !group.proposalDeadline && (
        <p className={s.intro}>공동소송으로 정해졌어요. 대표자가 제안 마감일을 정하면 로펌이 수임 제안서를 보낼 수 있어요.</p>
      )}
      {stage === 'collecting' && group.proposalDeadline && (
        <p className={s.intro}>
          공동소송으로 정해졌어요. 로펌 수임 제안서를 받는 중이에요 · 제안 마감 <b>{formatDateTime(group.proposalDeadline)}</b>.
          {' '}지금까지 <b>{proposals.length}건</b>이 도착했어요. 마감 후 대표자가 로펌 투표를 열어요.
        </p>
      )}
      {stage === 'ready' && (
        <p className={s.intro}>제안 접수가 끝났어요. 제안서 <b>{proposals.length}건</b>을 읽어 보세요. 대표자가 로펌 투표를 열면 투표할 수 있어요.</p>
      )}
      {stage === 'waiting' && vote && phase && (
        <>
          <p className={s.intro}>로펌 투표가 곧 시작돼요. 시작 전에 제안서 <b>{shown.length}건</b>을 미리 읽어 보세요. 시작 시각이 되면 투표 버튼이 열려요.</p>
          <PollStatus title="로펌 투표" phase={phase} opensAt={vote.opensAt} closesAt={vote.closesAt} />
        </>
      )}
      {voting && vote && phase && (
        <>
          <PollStatus title="로펌 투표" phase={phase} opensAt={vote.opensAt} closesAt={vote.closesAt} />
          <p className={s.intro}>
            로펌 <b>{shown.length}곳</b>이 수임 제안서를 보냈어요. 읽어 보고 한 곳에 투표해 주세요. <b>1인 1표 · 비공개</b>이고 {formatDateTime(vote.closesAt)}까지 바꿀 수 있어요.
          </p>
          {mine
            ? <p className={`${s.voteStatus} ${s.voteDone}`} role="status"><Icon name="vote-check" size={18} /><span>내 투표: <b>{shown.find((x) => x.id === mine)?.firmName}</b> · 마감 전까지 바꿀 수 있어요</span></p>
            : <p className={`${s.voteStatus} ${s.voteTodo}`} role="status"><Icon name="vote-alert" size={18} />아직 투표하지 않았어요</p>}
        </>
      )}
      {stage === 'counting' && <p className={s.intro}>로펌 투표 마감 시간이 지났어요. 서버가 결과를 집계하고 있어요. 잠시 후 새로고침해 주세요.</p>}
      {stage === 'retry' && vote && <p className={s.intro}>{RETRY_TEXT[vote.state] ?? '로펌이 정해지지 않았어요.'}</p>}
      {stage === 'selected' && (
        <>
          <p className={s.intro}>로펌 투표가 마감됐어요.</p>
          <section className={s.result} aria-label="투표 결과">
            <p className={s.resultLabel}>투표 결과</p>
            <h2 className={s.resultTitle}>선정된 로펌: {group.selectedFirmName ?? proposals.find((x) => x.id === winner)?.firmName ?? '확인 중'}</h2>
            <p className={s.resultDesc}>연락처 공개에 동의한 참여자 정보만 이 로펌에 전달돼요. 이후 절차는 로펌과 참여자가 직접 진행해요.</p>
          </section>
        </>
      )}

      {membership?.isRep && <RepControls data={data} runner={runner} />}

      {shown.length === 0
        ? <p className={s.note}>아직 도착한 제안서가 없어요.</p>
        : (
          <div className={s.pcGrid}>
            {shown.map((x) => {
              const f = cardOf(x)
              const win = stage === 'selected' && x.id === winner
              const v = optionOf(vote, x.id)?.voteCount ?? 0
              const tags = (
                <span>
                  {mine === x.id && <Tag tone="mine">내 투표</Tag>}
                  {win && <Tag tone="neon">선정</Tag>}
                </span>
              )
              return (
                <ProposalCard
                  key={x.id} id={x.id} firm={f} groupId={groupId} tags={tags}
                  highlight={voting && mine === x.id ? 'blue' : win ? 'neon' : undefined}
                  footer={ballot
                    ? <VoteButton fixed phase={phase} voted={mine === x.id} disabled={runner.busy} onClick={() => void castVote(x.id)}>이 로펌에 투표하기</VoteButton>
                    : vote && stage !== 'counting'
                      ? win ? <p className={s.pcVotesWin}><b>{v}표</b> · 선정</p> : <p className={s.pcVotes}>{v}표</p>
                      : <Link href={proposalHref(groupId, x.id)} className={s.cmpRead}>제안서 읽기</Link>}
                />
              )
            })}
          </div>
        )}

      {shown.length > 0 && (
        <div className={s.compare}>
          <button className={s.summary} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="compare-table">
            <Icon name={open ? 'compare-chevron' : 'compare-arrow'} size={14} />한눈에 비교하기 (표)
          </button>
          {open && (
            <div className={s.cmpWrap} id="compare-table">
              <table className={s.cmp}>
                <thead>
                  <tr>
                    <td />
                    {shown.map((x) => (
                      <th key={x.id} scope="col">
                        <span className={s.cmpFirm}>{x.firmName}</span>
                        <Link href={proposalHref(groupId, x.id)} className={s.cmpRead}>제안서 읽기</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {([['착수금', 'fee'], ['성공보수', 'successFee'], ['예상 기간', 'period'], ['대응 전략', 'strategy']] as const).map(([label, key]) => (
                    <tr key={key}><th scope="row">{label}</th>{shown.map((x) => <td key={x.id}>{cardOf(x)[key]}</td>)}</tr>
                  ))}
                  <tr><th scope="row">담당 변호사</th>{shown.map((x) => <td key={x.id}>{x.lawyerCount}명</td>)}</tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <p className={s.note}>누가 어디에 투표했는지는 공개되지 않아요. 투표 마감과 집계는 서버가 정해진 시간에 처리해요.</p>
      <Button variant="chip" size="sm" disabled={runner.busy} onClick={() => void runner.run('load', async () => {})}>새로고침</Button>
    </>
  )
}

// 대표자 전용: 제안 마감일 정하기 → (마감 후) 로펌 투표 열기
function RepControls({ data, runner }: { data: FirmVoteData; runner: ReturnType<typeof useRunner> }) {
  const { group, stage, proposals } = data
  const [deadline, setDeadline] = useState('')
  const [opens, setOpens] = useState('')
  const [closes, setCloses] = useState('')
  const canSetDeadline = stage === 'collecting' && proposals.length === 0
  const canOpen = stage === 'ready' || stage === 'retry'
  if (!canSetDeadline && !canOpen) return null

  return (
    <details className={s.compare} open>
      <summary className={s.summary}>대표자 메뉴</summary>
      {canSetDeadline && (
        <div>
          <p className={s.note}>로펌이 제안서를 낼 수 있는 마감일을 정해요. 제안서가 한 건이라도 들어오면 바꿀 수 없어요. 현재: {formatDateTime(group.proposalDeadline)}</p>
          <Field label="제안 마감" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Button size="sm" disabled={runner.busy || !deadline} onClick={() => void runner.run('deadline',
            () => call('setProposalDeadline', { groupId: group.id, deadline: new Date(deadline).toISOString() }), '제안 마감일을 정했어요')}>마감일 저장</Button>
        </div>
      )}
      {canOpen && (
        <div>
          <p className={s.note}>제출된 제안서 중 승인된 로펌의 제안서가 투표 선택지가 돼요. 마감 시간이 지나면 서버가 자동으로 집계해요.</p>
          <Field label="투표 시작" type="datetime-local" value={opens} onChange={(e) => setOpens(e.target.value)} />
          <Field label="투표 마감" type="datetime-local" value={closes} onChange={(e) => setCloses(e.target.value)} />
          <Button size="sm" disabled={runner.busy || !opens || !closes} onClick={() => void runner.run('openPoll',
            () => call('openPoll', { groupId: group.id, kind: 'firm', opensAt: new Date(opens).toISOString(), closesAt: new Date(closes).toISOString() }), '로펌 투표를 열었어요')}>로펌 투표 열기</Button>
        </div>
      )}
    </details>
  )
}
