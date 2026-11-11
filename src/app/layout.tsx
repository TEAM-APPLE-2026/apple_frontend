import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_KR, Poppins } from "next/font/google";
import UserShell from "@/components/layout/UserShell";
import "./tokens.css";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kr",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-num",
});

export const metadata: Metadata = {
  title: "Apple",
  description: "Apple team frontend",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${poppins.variable}`}>
      <body>
        <UserShell>{children}</UserShell>
      </body>
    </html>
  );
}
