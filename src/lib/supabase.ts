// 브라우저 전용 Supabase 클라이언트 (anon 키만 사용. service_role 키는 절대 넣지 않는다)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* 값은 빌드할 때 코드에 박히므로 process.env.이름 형태로 직접 읽어야 한다
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabase()는 브라우저에서만 사용할 수 있어요. 'use client' 컴포넌트 안에서 호출해 주세요.");
  }
  if (!url || !anonKey) {
    const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(Boolean);
    throw new Error(
      `Supabase 환경변수가 없어요: ${missing.join(", ")}. ` +
        ".env.example을 참고해 .env.local에 값을 넣고 개발 서버를 다시 시작해 주세요.",
    );
  }
  client ??= createClient(url, anonKey);
  return client;
}
