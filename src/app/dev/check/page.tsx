"use client";

// ⚠️ 개발용 연결 확인 페이지 (/dev/check) — 발표 전에 src/app/dev 폴더째 삭제할 것
// Supabase 연결 · 공개 키 여부 · 로그인 세션 · AI 모듈(analyze)이 동작하는지 보여 준다.
// 실제 화면(src/features/live/*)에서 확인할 수 없는 검사만 둔다:
// - 공개 키 확인, 로펌 국세청 조회 후 승인 상태 전이 확인 (PR #8 /dev/backend에서 옮김)

import { useEffect, useState } from "react";
import { connectedProjectRef, DEV_PROJECT_REF, getSupabase, isDevProject } from "@/lib/supabase";
import { backend } from "@/lib/backend";
import { call, type BusinessCheck, type Firm, type Profile } from "@/lib/live-api";
import { analyze, type AnalyzeResult } from "@/lib/ai";

const SAMPLE_TEXT = "[예시] ○○쇼핑에서 10월 초에 개인정보 유출 문자를 받았어요";

type Status = { state: "loading" } | { state: "ok"; detail: string } | { state: "fail"; detail: string };

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

// 브라우저에 넣은 키가 공개 키(anon/publishable)이고 URL과 같은 프로젝트의 키인지 확인한다.
// service_role 키나 다른 프로젝트 키를 넣은 실수를 잡기 위한 것이다.
function checkPublicKey(): Status {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return { state: "fail", detail: "환경변수 없음" };
  const ref = connectedProjectRef();
  if (!ref) return { state: "fail", detail: "NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다." };
  if (key.startsWith("sb_publishable_")) return { state: "ok", detail: `publishable 키 · 프로젝트 ${ref}` };
  if (key.startsWith("sb_secret_")) return { state: "fail", detail: "secret 키입니다. 공개 키로 바꿔 주세요." };
  try {
    const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.role !== "anon") return { state: "fail", detail: `role=${payload.role} 키입니다. anon 키로 바꿔 주세요.` };
    if (payload.ref !== ref) return { state: "fail", detail: `키의 프로젝트(${payload.ref})가 URL(${ref})과 다릅니다.` };
    return { state: "ok", detail: `anon 키 · 프로젝트 ${ref}` };
  } catch {
    return { state: "fail", detail: "키 형식을 알 수 없습니다." };
  }
}

// 승인 검사 기준은 연결된 프로젝트로 정한다(DEV_PROJECT_REF와 같을 때만 개발 기준).
// - 개발: firm_auto_approve 설정에 따른 pending → approved 자동 승인을 허용
// - 그 외(운영 등): 승인은 운영자 수동 처리뿐이므로 국세청 조회 전후 승인 상태가 같아야 한다
const approvalRule = () =>
  isDevProject()
    ? { dev: true, label: `개발(${DEV_PROJECT_REF}): 자동 승인 허용 — 변화 없음 또는 pending → approved면 통과` }
    : { dev: false, label: `운영(${connectedProjectRef() ?? "알 수 없음"}): 수동 승인 기준 — 국세청 조회 전후 승인 상태가 같아야 통과` };

// 국세청 조회(verifyBusiness)가 승인 상태를 허용된 방식으로만 바꾸는지 확인한다. rejected는 어느 환경에서도 바뀌면 안 된다.
async function checkFirmApproval(): Promise<Status> {
  const rule = approvalRule();
  const me = await call<Profile>("getMyProfile");
  if (me.profile.role !== "firm") return { state: "fail", detail: "로펌 계정으로 로그인한 뒤 눌러 주세요." };
  const before = await call<Firm>("getMyFirm");
  const verified = await call<BusinessCheck>("verifyBusiness");
  const after = await call<Firm>("getMyFirm");
  const from = before.approvalStatus;
  const to = after.approvalStatus;
  const summary = `bizValid=${verified.bizValid}, bizStatus=${verified.bizStatus}, 승인 ${from} → ${to}`;
  if (to !== verified.approvalStatus) return { state: "fail", detail: `응답(${verified.approvalStatus})과 DB(${to})가 다릅니다. ${summary}` };
  if (from === to) return { state: "ok", detail: summary };
  if (rule.dev && from === "pending" && to === "approved") return { state: "ok", detail: `${summary} (개발 자동 승인)` };
  const why = rule.dev ? "개발에서도 pending → approved 외의 변경은 허용되지 않습니다." : "운영 기준에서는 국세청 조회가 승인 상태를 바꾸면 안 됩니다.";
  return { state: "fail", detail: `${why} ${summary}` };
}

export default function DevCheckPage() {
  const [connection, setConnection] = useState<Status>({ state: "loading" });
  const [session, setSession] = useState<Status>({ state: "loading" });
  const [ai, setAi] = useState<AnalyzeResult | { error: { code: string; message: string } } | null>(null);
  const [publicKey] = useState<Status>(checkPublicKey);
  const [rule] = useState(approvalRule);
  const [firm, setFirm] = useState<Status | null>(null);

  const runFirmCheck = async () => {
    setFirm({ state: "loading" });
    try {
      setFirm(await checkFirmApproval());
    } catch (e) {
      setFirm({ state: "fail", detail: errorText(e) });
    }
  };

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
      <StatusRow label="공개 키" status={publicKey} />
      <StatusRow label="로그인 세션" status={session} />
      <h2 style={{ marginTop: 16 }}>로펌 승인 상태 전이 (로펌 계정 로그인 필요)</h2>
      <p>국세청 조회를 실제로 실행하고, 조회 전후 승인 상태를 비교합니다.</p>
      <p>검사 기준: {rule.label}</p>
      <button type="button" disabled={firm?.state === "loading"} onClick={() => void runFirmCheck()}>
        국세청 조회·승인 상태 확인
      </button>
      {firm && <StatusRow label="승인 상태 전이" status={firm} />}
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
