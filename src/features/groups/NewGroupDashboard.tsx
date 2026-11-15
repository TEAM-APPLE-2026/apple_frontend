'use client'

import { useCallback, useState } from 'react'
import Button from '@/components/common/Button'
import Icon from '@/components/common/Icon'
import Toast from '@/components/common/Toast'
import { currentUser } from '@/lib/mock'
import { NEW_GROUP } from './dashboardData'
import { NEW_GROUP_TITLE } from './data'
import { DashFrame, useCopyLink } from './GroupDashboard'
import { Callout, KvBox, Meter, Milestones } from './parts'
import s from './Dashboard.module.css'

const SUBS = [`참여 ${NEW_GROUP.members}명 · 대표자 선정 전`, '대표자 선정 후', '대응 방법 결정 후', '결과 한 줄 표시']

// U-36 새 그룹 현황 · U-37 대응 방법 잠김 · U-38 참여자
export default function NewGroupDashboard() {
  const [tab, setTab] = useState('overview')
  const [toast, setToast] = useState<string | null>(null)
  const clear = useCallback(() => setToast(null), [])
  const copy = useCopyLink(setToast)
  const left = NEW_GROUP.leaderGoal - NEW_GROUP.members

  return (
    <>
      <DashFrame
        title={NEW_GROUP_TITLE} badge={{ label: '모집 중', tone: 'line' }} meta={['대표자 선정 전', NEW_GROUP.created]} stage={0} subs={SUBS}
        tabs={[
          { id: 'overview', label: '현황' },
          { id: 'method', label: '대응 방법', extra: <Icon name="tab-lock" size={14} /> },
          { id: 'people', label: '참여자' },
        ]}
        tab={tab} onTab={setTab} onCopy={copy}
      >
        {tab === 'overview' && (
          <>
            <Callout
              label={`대표자 선정까지 ${left}명`} title="함께할 사람을 모아 주세요"
              desc="같은 피해를 겪은 사람에게 링크를 공유해 주세요. 10명이 모이면 참여자 중에서 대표자를 정해요."
              action={<Button onClick={copy}>링크 공유해서 함께할 사람 모으기</Button>}
            >
              <div className={s.turnout}>
                <p>참여 <b>{NEW_GROUP.members}</b> / {NEW_GROUP.leaderGoal}명</p>
                <Meter value={NEW_GROUP.members} max={NEW_GROUP.leaderGoal} />
              </div>
            </Callout>
            <Milestones rows={NEW_GROUP.milestones} />
          </>
        )}
        {tab === 'method' && (
          <div className={s.locked}>
            <Icon name="lock-lg" size={28} />
            <p className={s.lockedTitle}>10명이 모이고 대표자가 정해지면 열려요</p>
            <p className={s.lockedDesc}>지금은 참여 {NEW_GROUP.members}명이에요. 대응 방법 투표는 대표자가 정해진 뒤 시작해요.</p>
          </div>
        )}
        {tab === 'people' && (
          <>
            <KvBox rows={[{ label: '참여자', value: `${currentUser.nickname} (나 · 개설자)` }]} />
            <p className={s.note}>다른 참여자에게는 닉네임 · 피해 정도 · 시기만 보여요.</p>
          </>
        )}
      </DashFrame>
      <Toast message={toast} onDone={clear} className={s.toast} />
    </>
  )
}
