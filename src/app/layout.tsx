import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_KR, Poppins } from "next/font/google";
import "./tokens.css";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kr",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-num",
});

export const metadata: Metadata = {
  title: "HANDE",
  description: "같은 피해를 입은 사람들을 한 그룹으로 모으고, 규모에 맞는 대응 방법을 함께 고르도록 도와요.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

// 화면별 레이아웃은 라우트 그룹에서 정합니다: (intro) = IntroHeader, (user) = UserShell
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
