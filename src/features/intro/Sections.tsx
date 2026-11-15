import Link from 'next/link'
import type { ReactNode } from 'react'
import Icon from '@/components/common/Icon'
import { GATHER_COLS, ORGANIZE_COLS, SHEET, STEPS, type Col } from './data'
import s from './IntroHome.module.css'

// 섹션 공통 머리: eyebrow(정리하기 /01) · h2 두 줄 · lead
export function SectionHead({ eyebrow, strong, light, lead }: {
  eyebrow: ReactNode; strong: ReactNode; light: string; lead?: string
}) {
  return (
    <>
      <p className={s.eyebrow}>{eyebrow}</p>
      <h2 className={s.h2}>
        <span className={s.h2Strong}>{strong}</span>
        <span className={s.h2Light}>{light}</span>
      </h2>
      {lead && <p className={s.lead}>{lead}</p>}
    </>
  )
}

export const Num = ({ children }: { children: string }) => <span className={`num ${s.eyebrowNum}`}>{children}</span>

function Cols({ cols }: { cols: Col[] }) {
  return (
    <div className={s.cols}>
      {cols.map((c) => (
        <div key={c.title} className={s.col}>
          <h3 className={s.colTitle}>{c.title}</h3>
          <p className={s.colDesc}>{c.desc}</p>
          <p className={s.colSum}>{c.sum}</p>
        </div>
      ))}
    </div>
  )
}

// sec-organize · 정리하기
export function OrganizeSection() {
  const found = SHEET.rows.filter((r) => r.value).length
  return (
    <section id="organize" className={s.section} aria-labelledby="organize-h">
      <SectionHead
        eyebrow={<>정리하기 <Num>/01</Num></>}
        strong={<span id="organize-h">글로 적으면<span className="num">,</span></span>}
        light="한 장으로 정리돼요"
        lead="기업 · 유형 · 시기를 찾아 칸을 채우고, 못 찾은 값은 비워둬요."
      />
      <div className={s.sheet}>
        <p className={s.sheetLabel}>내가 적은 내용 <span className={s.sheetTag}>[예시]</span></p>
        <p className={s.sheetQuote}>{SHEET.quote}</p>
        <table className={s.tbl}>
          <thead>
            <tr><th scope="col">항목</th><th scope="col">정리된 값</th><th scope="col">근거</th></tr>
          </thead>
          <tbody>
            {SHEET.rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.key}</th>
                <td className={r.value ? s.tblValue : s.tblMissing}>{r.value ?? '확인 필요'}</td>
                <td className={s.tblSource}>{r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={s.sheetFoot}>
          {SHEET.rows.length}개 중 {found}개 자동 정리 · {SHEET.rows.length - found}개 확인 필요
        </p>
      </div>
      <Cols cols={ORGANIZE_COLS} />
    </section>
  )
}

// sec-gather · 모으기
export function GatherSection() {
  return (
    <section id="gather" className={s.section} aria-labelledby="gather-h">
      <SectionHead
        eyebrow={<>모으기 <Num>/02</Num></>}
        strong={<span id="gather-h">같은 피해를</span>}
        light="한 그룹으로"
        lead="비슷한 그룹을 점수와 맞는 점 · 다른 점으로 보여줘요. 10명이 모이면 대표자를 정해요."
      />
      <Cols cols={GATHER_COLS} />
    </section>
  )
}

// sec-decide · 대응하기
export function DecideSection() {
  return (
    <section id="decide" className={s.section} aria-labelledby="decide-h">
      <SectionHead
        eyebrow={<>정하기 <Num>/03</Num> · 연결하기 <Num>/04</Num></>}
        strong={<span id="decide-h">규모에 맞는</span>}
        light="대응 방법"
        lead="인원 · 피해 유형에 맞춰 무료 분쟁조정부터 안내하고, 공동소송을 고르면 로펌 수임 제안서를 비교해 피해자 투표로 정해요."
      />
      <ol className={s.tl}>
        {STEPS.map((step, i) => (
          <li key={step.title} className={s.tlStep}>
            <span className={`num ${s.tlNum}`}>{String(i + 1).padStart(2, '0')}</span>
            <div className={s.tlBody}>
              <h3 className={s.tlTitle}>{step.title}</h3>
              <p className={s.tlDesc}>{step.desc}</p>
            </div>
            <p className={s.tlMeta}>
              <Icon name={step.icon} size={14} />
              {step.meta}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

// footer
export function IntroFooter() {
  return (
    <footer className={s.footer}>
      <p className={`num ${s.footLogo}`}>HANDE</p>
      <p className={s.footText}>
        HANDE는 법률 자문을 제공하지 않으며, 사건 소개나 수임에 따른 수수료를 받지 않습니다. 이 페이지의 로그인 · 저장 · 첨부는 모두 시연용이에요.
      </p>
      <nav className={s.footLinks} aria-label="바닥글">
        <Link href="/cases">사건 둘러보기</Link>
        <Link href="/login/firm">로펌 로그인</Link>
        <Link href="/">시연 처음 상태로</Link>
      </nav>
      <p className={`num ${s.copy}`}>© 2026 HANDE. All rights reserved.</p>
    </footer>
  )
}
