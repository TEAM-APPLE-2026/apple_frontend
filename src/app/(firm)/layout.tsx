import type { ReactNode } from "react";
import FirmShell from "@/components/layout/FirmShell";

// 로펌 화면 (Figma 03 로펌)
export default function FirmLayout({ children }: { children: ReactNode }) {
  return <FirmShell>{children}</FirmShell>;
}
