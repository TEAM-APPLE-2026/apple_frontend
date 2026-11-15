import CasesSection from '@/features/intro/CasesSection'
import FaqSection from '@/features/intro/FaqSection'
import Hero from '@/features/intro/Hero'
import { DecideSection, GatherSection, IntroFooter, OrganizeSection } from '@/features/intro/Sections'
import SideIndicator from '@/features/intro/SideIndicator'
import s from '@/features/intro/IntroHome.module.css'

// I-01 홈 (소개 페이지) · I-02 FAQ 답변 펼침
export default function IntroHomePage() {
  return (
    <div className={s.home}>
      <Hero />
      <SideIndicator />
      <div className={s.wrap}>
        <OrganizeSection />
        <GatherSection />
        <DecideSection />
        <CasesSection />
        <FaqSection />
      </div>
      <IntroFooter />
    </div>
  )
}
