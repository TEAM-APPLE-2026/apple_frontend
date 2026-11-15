'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import p from '@/components/layout/Page.module.css'
import { userActions, useUserState } from '@/features/user/store'
import { DEMO_CASE_ID, type Case } from './data'
import s from './CaseDetail.module.css'

// U-16 로그인 전 · U-17 로그인 필요(확인창) · U-18 참여 중 · U-19 다른 예시 사건 · U-20 종결 사건
export default function CaseActions({ c, result }: { c: Pick<Case, 'id' | 'status'>; result?: string }) {
  const { loggedIn, joined } = useUserState()
  const [askLogin, setAskLogin] = useState(false)
  const close = useCallback(() => setAskLogin(false), [])

  const back = <Button href="/cases" variant="chip">사건 목록으로</Button>

  if (c.status === 'closed') {
    return (
      <div className={`${p.actions} ${s.noteActions}`}>
        {back}
        <p className={s.note}>종결된 사건이라 새로 참여할 수 없어요. 결과: {result}</p>
      </div>
    )
  }

  if (c.id !== DEMO_CASE_ID) {
    return (
      <div className={`${p.actions} ${s.noteActions}`}>
        {back}
        <p className={s.note}>
          시연에서는 대표 예시 사건만 참여할 수 있어요. <Link href={`/cases/${DEMO_CASE_ID}`}>대표 사건 보기</Link>
        </p>
      </div>
    )
  }

  const isJoined = loggedIn && joined.includes(c.id)
  return (
    <div className={p.actions}>
      {back}
      {isJoined
        ? <Button href={`/groups/${c.id}`}>참여 중 · 대시보드 보기</Button>
        : loggedIn
          ? <Button onClick={() => userActions.join(c.id)}>참여하기</Button>
          : <Button onClick={() => setAskLogin(true)}>로그인하고 참여하기</Button>}

      {askLogin && (
        <Modal title="로그인이 필요해요" onClose={close}>
          <p className={s.modalDesc}>그룹에 참여하거나 새 그룹을 열려면 일반 사용자로 로그인해야 해요. 시연용이라 바로 로그인돼요.</p>
          <div className={s.modalRow}>
            <Button block onClick={() => { userActions.join(c.id); close() }}>로그인하고 계속하기</Button>
            <Button block variant="chip" onClick={close}>취소</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
