// 백엔드 연결 진입점. 화면에서는 `import { backend } from "@/lib/backend"`로만 사용한다.
// client.mjs는 backend 레포에서 복사한 파일이라 직접 수정하지 않는다.
// (출처: backend feature/firm-auto-verify src/data/client.mjs. 예외: 회원가입 오류 문구 5종은 프론트 d362863에서 추가 — backend 반영 전까지 유지)
import { createBackendClient } from "./client.mjs";
import { getSupabase } from "@/lib/supabase";

export type BackendClient = ReturnType<typeof createBackendClient>;

let instance: BackendClient | null = null;

// 앱 전체에서 하나만 만든다. 서버 렌더링·빌드 중에 환경변수 에러가 나지 않도록
// 처음 메서드를 쓸 때(브라우저) 생성한다.
export const backend: BackendClient = new Proxy({} as BackendClient, {
  get(_target, prop) {
    instance ??= createBackendClient(getSupabase());
    return instance[prop as keyof BackendClient];
  },
});
