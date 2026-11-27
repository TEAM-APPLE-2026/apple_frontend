import type { ReactNode } from "react";
import FluidBackground from "@/components/common/FluidBackground";
import IntroHeader from "@/components/layout/IntroHeader";

// 로그인 전 화면 (Figma 01 소개 · 로그인) — 흐르는 빛 배경은 소개 홈에서만 보임
export default function IntroLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", isolation: "isolate", background: "var(--bg)", minHeight: "100vh" }}>
      <FluidBackground />
      <IntroHeader />
      <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
    </div>
  );
}
