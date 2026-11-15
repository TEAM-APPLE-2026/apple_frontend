'use client'

import { useEffect, useState } from 'react'
import BackLink from '@/components/common/BackLink'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import Field from '@/components/common/Field'
import Icon from '@/components/common/Icon'
import StateBox from '@/components/common/StateBox'
import { userActions } from '@/features/user/store'
import p from '@/components/layout/Page.module.css'
import stateBox from '@/components/common/StateBox.module.css'
import { EVIDENCE, EXAMPLE_FIELDS, EXAMPLE_TEXT, MATCH, MATCH_KEYWORD, MIN_TEXT, type ReportField } from './data'
import Stepper from './Stepper'
import s from './ReportFlow.module.css'

type Step = 'write' | 'analyzing' | 'failed' | 'review' | 'match' | 'nomatch' | 'newGroup' | 'done'

const BAR: Record<Exclude<Step, 'done'>, { label: string; back: string; step: 1 | 2 | 3 }> = {
  write: { label: '1 / 4 · 피해 내용 작성', back: '처음으로', step: 1 },
  analyzing: { label: '2 / 4 · AI 정리 확인', back: '작성한 글 고치기', step: 2 },
  failed: { label: '2 / 4 · AI 정리 확인', back: '작성한 글 고치기', step: 2 },
  review: { label: '2 / 4 · AI 정리 확인', back: '작성한 글 고치기', step: 2 },
  match: { label: '3 / 4 · 같은 사건 찾기', back: '정리 결과로', step: 3 },
  nomatch: { label: '3 / 4 · 같은 사건 찾기', back: '정리 결과로', step: 3 },
  newGroup: { label: '3-2 / 4 · 새 그룹 만들기', back: '사건 목록으로', step: 3 },
}

// U-02 ~ U-12 피해 등록 (글로 적기 → AI 정리 → 같은 사건 찾기 → 참여)
export default function ReportFlow() {
  const [step, setStep] = useState<Step>('write')
  const [text, setText] = useState('')
  const [fields, setFields] = useState<ReportField[]>(EXAMPLE_FIELDS)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])

  const go = (next: Step) => {
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  // U-04 분석 중 → U-05 실패 / U-06 결과 (시연: 잠깐 기다린 뒤 결과)
  useEffect(() => {
    if (step !== 'analyzing') return
    const id = window.setTimeout(() => setStep(text.trim().length < MIN_TEXT ? 'failed' : 'review'), 1400)
    return () => window.clearTimeout(id)
  }, [step, text])

  const openEdit = (f: ReportField) => {
    setEditing(f.key)
    setDraft(f.value ?? '')
  }
  const saveEdit = (key: string) => {
    if (!draft.trim()) return
    setFields((list) => list.map((f) => (f.key === key ? { ...f, value: draft.trim(), edited: true } : f)))
    setEditing(null)
  }

  const need = fields.filter((f) => f.value === null).length
  const auto = fields.filter((f) => f.value !== null && !f.edited).length

  if (step === 'done') {
    return (
      <div className={`${p.page} ${s.done}`}>
        <Stepper step={4} />
        <div className={s.doneMark}><Icon name="done-check" size={26} /></div>
        <h1 className={s.doneTitle}>새 그룹을 열었어요</h1>
        <p className={p.sub}>정리한 내용으로 새 그룹을 만들었어요. 링크를 공유해서 함께할 사람을 모아 주세요. 10명이 모이면 대표자를 정해요.</p>
        <div className={p.actions}>
          <Button href="/groups" variant="chip">내 그룹 보기</Button>
          <Button href="/groups/new">그룹 대시보드로</Button>
        </div>
      </div>
    )
  }

  const bar = BAR[step]
  const matchStep: Step = text.includes(MATCH_KEYWORD) ? 'match' : 'nomatch'
  const backTo: Partial<Record<Step, Step>> = { analyzing: 'write', failed: 'write', review: 'write', match: 'review', nomatch: 'review', newGroup: matchStep }
  const back = backTo[step]

  return (
    <div className={`${p.page} ${p.narrow}`}>
      <div className={p.bar}>
        <p className={p.barLabel}>{bar.label}</p>
        {back
          ? <button className={s.back} onClick={() => go(back)}>
              <Icon name="back-arrow" size={16} />{bar.back}
            </button>
          : <BackLink href="/home" label={bar.back} />}
      </div>
      <div className={s.stepper}><Stepper step={bar.step} /></div>

      {step === 'write' && (
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) go('analyzing') }}>
          <h1 className={s.title}>어떤 피해를 입으셨나요?</h1>
          <p className={p.sub}>겪은 일을 편하게 적어 주세요. AI가 기업 · 피해 유형 · 시기를 찾아 정리해요.</p>
          <Field
            multiline label="겪은 일" className={s.story} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="예: 10월 초에 △△ 통신사에서 고객정보가 유출됐다는 문자를 받았어요."
          />
          <div className={p.actions}>
            <button type="button" className={s.link} onClick={() => setText(EXAMPLE_TEXT)}>예시 문장 넣기</button>
            <Button type="submit" arrow disabled={!text.trim()}>다음 · AI 정리 보기</Button>
          </div>
        </form>
      )}

      {step === 'analyzing' && (
        <>
          <h1 className={s.title}>AI가 정리하고 있어요</h1>
          <div className={s.box}>
            <StateBox
              icon={<Icon name="spinner" size={32} className={stateBox.spin} />}
              title="잠시만 기다려 주세요"
              desc="쓴 글에서 기업 · 피해 유형 · 시기를 찾는 중이에요. 보통 몇 초면 끝나요."
            />
          </div>
        </>
      )}

      {step === 'failed' && (
        <>
          <h1 className={s.title}>정리하지 못했어요</h1>
          <div className={s.box}>
            <StateBox error icon={<Icon name="alert-lg" size={32} />} title="정리하지 못했어요" desc="잠시 후 다시 시도해 주세요. 쓴 글은 그대로 남아 있어요.">
              <Button variant="chip" onClick={() => go('write')}>글 고치기</Button>
              <Button onClick={() => go('analyzing')}>다시 정리하기</Button>
            </StateBox>
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <h1 className={s.title}>이렇게 정리했어요</h1>
          <p className={p.sub}>값마다 원문 근거를 함께 보여줘요. 틀린 곳은 &quot;수정&quot;을 눌러 고쳐 주세요.</p>
          <blockquote className={s.quote}>
            <p className={s.quoteLabel}>내가 적은 내용</p>
            <p className={s.quoteText}>&quot;{text}&quot;</p>
          </blockquote>
          <ul className={s.frows}>
            {fields.map((f) => {
              const isNeed = f.value === null
              const isEditing = editing === f.key
              return (
                <li key={f.key} className={`${s.frow} ${isNeed ? s.need : ''}`}>
                  <span className={s.fLabel}>{f.label}</span>
                  <div className={s.fValue}>
                    <p className={isNeed ? s.vNeed : s.v}>{f.value ?? '확인 필요'}</p>
                    <p className={s.src}>{isNeed ? '원문에 없음 · 직접 채워 주세요' : f.edited ? '직접 고친 값' : `근거 "${f.source}"`}</p>
                    {isEditing && (
                      <form className={s.edit} onSubmit={(e) => { e.preventDefault(); saveEdit(f.key) }}>
                        <Field
                          aria-label={`${f.label} 값`} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                          placeholder={isNeed ? '예: 없음 / 있음 / 모름' : undefined} className={s.editField}
                        />
                        <Button type="submit" variant="chip" size="sm">저장</Button>
                      </form>
                    )}
                  </div>
                  <button className={isNeed ? s.fillBtn : s.editBtn} onClick={() => (isEditing ? setEditing(null) : openEdit(f))} aria-expanded={isEditing}>
                    {isEditing ? '닫기' : isNeed ? '채우기' : '수정'}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className={s.sum}>
            {need > 0 ? `${fields.length}개 중 ${auto}개 자동 정리 · ${need}개 확인 필요` : `${fields.length}개 모두 확인했어요`}
          </p>
          <p className={s.note}>시연 화면이라 정리 결과는 예시 문장 기준으로 보여줘요.</p>
          <fieldset className={s.checks}>
            <legend className={s.checksTitle}>가지고 있는 증빙 자료를 골라 주세요</legend>
            {EVIDENCE.map((ev) => (
              <Checkbox
                key={ev} label={ev} checked={evidence.includes(ev)}
                onChange={(e) => setEvidence((list) => (e.target.checked ? [...list, ev] : list.filter((x) => x !== ev)))}
              />
            ))}
          </fieldset>
          <div className={`${p.actions} ${p.actionsEnd}`}>
            <Button arrow onClick={() => go(matchStep)}>다음 · 같은 사건 찾기</Button>
          </div>
        </>
      )}

      {step === 'match' && (
        <>
          <h1 className={s.title}>같은 사건을 찾았어요</h1>
          <p className={p.sub}>적어 주신 내용과 가장 비슷한 사건이에요. 내 경우와 맞는지 확인해 주세요.</p>
          <div className={s.match}>
            <div className={s.score}>
              <p className={s.scoreNum}><span className="num">{MATCH.score}</span>/ 100점</p>
              <p className={s.scoreLabel}>같은 사건일 가능성 높음</p>
            </div>
            <div className={s.matchInfo}>
              <p className={s.matchTitle}>{MATCH.title}</p>
              <p className={s.matchMeta}>{MATCH.meta} <small>[예시 수치]</small></p>
            </div>
          </div>
          <div className={p.actions}>
            <button className={s.strongLink} onClick={() => go('newGroup')}>내 경우와 달라요 · 새 그룹 만들기</button>
            <Button href={`/cases/${MATCH.id}`} arrow>이 사건 자세히 보기</Button>
          </div>
        </>
      )}

      {step === 'nomatch' && (
        <>
          <h1 className={s.title}>비슷한 사건을 찾지 못했어요</h1>
          <div className={s.box}>
            <StateBox
              icon={<Icon name="search-lg" size={32} />}
              title="비슷한 사건을 찾지 못했어요"
              desc="아직 같은 피해로 모인 그룹이 없어요. 새 그룹을 열면 같은 피해를 겪은 사람이 찾아올 수 있어요."
            >
              <Button href="/cases" variant="chip">사건 둘러보기</Button>
              <Button onClick={() => go('newGroup')}>새 그룹 만들기</Button>
            </StateBox>
          </div>
        </>
      )}

      {step === 'newGroup' && (
        <>
          <h1 className={s.title}>새 그룹으로 열까요?</h1>
          <p className={p.sub}>정리한 내용을 바탕으로 새 그룹을 열어요. 10명이 모이면 대표자를 정해요.</p>
          <dl className={`${p.dl} ${p.dlBox}`}>
            {fields.filter((f) => f.summary).map((f) => (
              <div key={f.key} className={p.dlRow}>
                <dt className={p.dt}>{f.label}</dt>
                <dd className={p.dd}>{f.value ?? '확인 필요'}</dd>
              </div>
            ))}
          </dl>
          <div className={p.actions}>
            <Button variant="chip" onClick={() => go(matchStep)}>이전</Button>
            <Button onClick={() => { userActions.createGroup(); go('done') }}>새 그룹 열기</Button>
          </div>
        </>
      )}
    </div>
  )
}
