import s from './FirmPage.module.css'

// F-12 · F-13 준비 중 화면
export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className={`${s.page} ${s.wide}`}>
      <h1 className={s.title}>{title}</h1>
      <div className={s.emptyBox}>
        <p className={s.soon}>다음 단계에서 만들어요</p>
      </div>
    </div>
  )
}
