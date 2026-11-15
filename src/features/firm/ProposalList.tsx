'use client'

import Badge, { type BadgeTone } from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import { findGroup } from './data'
import { firmActions, useFirmState, type ProposalStatus } from './store'
import s from '@/components/layout/Page.module.css'
import l from './ProposalList.module.css'

const STATUS: Record<ProposalStatus, { label: string; tone: BadgeTone }> = {
  submitted: { label: '제출됨', tone: 'line' },
  voting: { label: '피해자 투표 중', tone: 'blue' },
  selected: { label: '선정됨', tone: 'white' },
}

// F-08 빈 상태 · F-09 제출됨 · F-10 피해자 투표 중 · F-11 선정됨
export default function ProposalList() {
  const { proposals } = useFirmState()

  if (proposals.length === 0) {
    return (
      <div className={s.emptyBox}>
        <p className={s.emptyTitle}>아직 제출한 제안서가 없습니다</p>
        <p className={s.emptyDesc}>공동소송으로 정해진 그룹에 수임 제안서를 보낼 수 있습니다.</p>
        <Button href="/firm" size="sm">사건 탐색으로</Button>
      </div>
    )
  }

  const selected = proposals.filter((p) => p.status === 'selected')

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
            {proposals.map((p) => {
              const g = findGroup(p.groupId)
              const st = STATUS[p.status]
              return (
                <tr key={p.groupId}>
                  <th scope="row" className={s.groupName}>{g?.title ?? p.groupId}</th>
                  <td>{p.submittedAt}</td>
                  <td><Badge tone={st.tone}>{st.label}</Badge></td>
                  <td>착수금 {p.fee} · 성공보수 {p.successFee}%</td>
                  <td className={s.action}>
                    {p.status !== 'selected' && (
                      <>
                        <button className={l.demo} onClick={() => firmActions.advanceProposal(p.groupId)}>[시연] 다음 상태</button>
                        <Button href={`/firm/groups/${p.groupId}`} variant="chip" size="sm">그룹 보기</Button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected.map((p) => (
        <section key={p.groupId} className={l.result} aria-label="선정 결과">
          <p className={l.resultLabel}>선정됨</p>
          <h2 className={l.resultTitle}>{findGroup(p.groupId)?.title} 그룹이 귀 법인을 선택했습니다</h2>
          <p className={l.resultDesc}>
            연락처 공개에 동의한 참여자 정보만 전달됩니다. 이후 절차는 로펌과 참여자가 직접 진행합니다. 참여자 명단은 다음 단계의 &quot;담당 사건&quot;에서 확인합니다.
          </p>
        </section>
      ))}

      <p className={s.lockNote}>
        <Icon name="lock-note" size={16} />
        제출된 수임 제안서는 피해자 투표로 선택됩니다. 선정 전에는 참여자의 실명 · 연락처를 볼 수 없습니다.
      </p>
    </>
  )
}
