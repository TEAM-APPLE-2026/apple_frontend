'use client'

import Badge, { type BadgeTone } from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { formatDate, formatWon } from '@/lib/live-api'
import { acceptsProposals, useFirmGroups, type FirmProposalStatus } from './live'
import s from '@/components/layout/Page.module.css'
import l from './ProposalList.module.css'
import { routes } from '@/lib/routes'

const STATUS: Record<FirmProposalStatus, { label: string; tone: BadgeTone }> = {
  submitted: { label: '제출됨', tone: 'line' },
  voting: { label: '피해자 투표 중', tone: 'blue' },
  selected: { label: '선정됨', tone: 'white' },
  not_selected: { label: '선정되지 않음', tone: 'dim' },
  withdrawn: { label: '철회함', tone: 'dim' },
  closed: { label: '접수 마감', tone: 'dim' },
}

// F-08 빈 상태 · F-09 제출됨 · F-10 피해자 투표 중 · F-11 선정됨
export default function ProposalList() {
  const { rows, error, reload } = useFirmGroups()

  if (error) return <p role="alert" className={s.note}>{error} <Button variant="chip" size="sm" onClick={() => void reload()}>다시 불러오기</Button></p>
  if (!rows) return <p role="status" className={s.note}>내 제안서를 불러오고 있습니다.</p>
  const mine = rows.filter((r) => r.mine)

  if (mine.length === 0) {
    return (
      <div className={s.emptyBox}>
        <p className={s.emptyTitle}>아직 제출한 제안서가 없습니다</p>
        <p className={s.emptyDesc}>공동소송으로 정해진 그룹에 수임 제안서를 보낼 수 있습니다.</p>
        <Button href="/firm" size="sm">사건 탐색으로</Button>
      </div>
    )
  }

  const selected = mine.filter((r) => r.status === 'selected')

  return (
    <>
      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th scope="col">그룹</th>
              <th scope="col" style={{ width: 126 }}>제출일</th>
              <th scope="col" style={{ width: 146 }}>상태</th>
              <th scope="col" style={{ width: 276 }}>제안 요약</th>
              <th scope="col"><span className="sr-only">작업</span></th>
            </tr>
          </thead>
          <tbody>
            {mine.map(({ group: g, mine: x, status }) => {
              const st = STATUS[status ?? 'closed']
              return (
                <tr key={g.id}>
                  <th scope="row" className={s.groupName}>{g.name}</th>
                  <td>{formatDate(x!.submittedAt)}</td>
                  <td><Badge tone={st.tone}>{st.label}</Badge></td>
                  <td>착수금 {formatWon(x!.retainerFee)} · 성공보수 {x!.successFeePct}%</td>
                  <td className={s.action}>
                    {acceptsProposals(g) && <Button href={routes.firmGroupProposal(g.id)} variant="chip" size="sm">{x!.status === 'withdrawn' ? '다시 제출' : '수정 · 철회'}</Button>}
                    {' '}<Button href={routes.firmGroupView(g.id)} variant="chip" size="sm">그룹 보기</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {mine.some((r) => r.status === 'voting') && (
        <p className={s.note}>피해자 투표 중에는 다른 로펌의 득표와 내 득표가 보이지 않습니다. 투표가 마감되면 서버가 집계하고 결과가 이 화면에 표시됩니다.</p>
      )}

      {selected.map(({ group: g, myVotes }) => (
        <section key={g.id} className={l.result} aria-label="선정 결과">
          <p className={l.resultLabel}>선정됨{myVotes ? ` · ${myVotes.myVoteCount}표` : ''}</p>
          <h2 className={l.resultTitle}>{g.name} 그룹이 귀 법인을 선택했습니다</h2>
          <p className={l.resultDesc}>
            연락처 공개에 동의한 참여자 정보만 전달됩니다. 이후 절차는 로펌과 참여자가 직접 진행합니다. 참여자 명단은 다음 단계의 &quot;담당 사건&quot;에서 확인합니다.
          </p>
        </section>
      ))}

      <Button variant="chip" size="sm" onClick={() => void reload()}>새로고침</Button>
      <p className={s.lockNote}>
        <Icon name="lock-note" size={16} />
        제출된 수임 제안서는 피해자 투표로 선택됩니다. 선정 전에는 참여자의 실명 · 연락처를 볼 수 없습니다.
      </p>
    </>
  )
}
