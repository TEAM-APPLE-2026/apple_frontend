import type { ReactNode } from "react";
import IntroHeader from "@/components/layout/IntroHeader";

// 로그인 전 화면 (Figma 01 소개 · 로그인)
export default function IntroLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <IntroHeader />
      <main>{children}</main>
    </>
  );
}
