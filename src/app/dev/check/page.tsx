"use client";

// ⚠️ 개발용 연결 확인 페이지 (/dev/check) — 발표 전에 src/app/dev 폴더째 삭제할 것
// Supabase 연결 · 로그인 세션 · AI 모듈(analyze)이 동작하는지만 보여 준다.

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { backend } from "@/lib/backend";
import { analyze, type AnalyzeResult } from "@/lib/ai";

const SAMPLE_TEXT = "[예시] ○○쇼핑에서 10월 초에 개인정보 유출 문자를 받았어요";

type Status = { state: "loading" } | { state: "ok"; detail: string } | { state: "fail"; detail: string };

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function DevCheckPage() {
  const [connection, setConnection] = useState<Status>({ state: "loading" });
  const [session, setSession] = useState<Status>({ state: "loading" });
  const [ai, setAi] = useState<AnalyzeResult | { error: { code: string; message: string } } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = getSupabase();

        // 로그인 세션 유무
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) setSession({ state: "fail", detail: error.message });
        else setSession({ state: "ok", detail: data.session ? `로그인됨 (${data.session.user.id})` : "로그인 안 됨" });

        // Supabase 연결: 비로그인으로도 부를 수 있는 listGroups로 실제 요청을 보내 본다
        const res = await backend.listGroups({ limit: 1 });
        if (cancelled) return;
        if ("error" in res && res.error) setConnection({ state: "fail", detail: `${res.error.code}: ${res.error.message}` });
        else setConnection({ state: "ok", detail: "listGroups 응답 받음" });
      } catch (e) {
        if (cancelled) return;
        setConnection({ state: "fail", detail: errorText(e) });
        setSession({ state: "fail", detail: errorText(e) });
      }
    })();

    analyze(SAMPLE_TEXT)
      .then((r) => !cancelled && setAi(r))
      .catch((e) => !cancelled && setAi({ error: { code: "EXCEPTION", message: errorText(e) } }));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "monospace", lineHeight: 1.6 }}>
      <h1>연결 확인 (개발용)</h1>
      <StatusRow label="Supabase 연결" status={connection} />
      <StatusRow label="로그인 세션" status={session} />
      <h2 style={{ marginTop: 16 }}>analyze 결과</h2>
      <p>입력: {SAMPLE_TEXT}</p>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: 12 }}>
        {ai ? JSON.stringify(ai, null, 2) : "분석 중…"}
      </pre>
    </main>
  );
}

function StatusRow({ label, status }: { label: string; status: Status }) {
  const mark = status.state === "loading" ? "…" : status.state === "ok" ? "✅" : "❌";
  return (
    <p>
      {mark} {label}: {status.state === "loading" ? "확인 중" : status.detail}
    </p>
  );
}
