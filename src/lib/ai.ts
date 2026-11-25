// HANDE AI 모듈(@team-apple/hande-ai v0.4.0) 진입점. 화면에서는 여기서만 가져다 쓴다.
// 예) const r = await analyze(text);  // { data: { fields, warnings } } | { error: { code, message } }
// 예) const candidates = match({ fields }, groups);  // 같은 사건 후보(점수 높은 순)
// 예) const draft = draftGroup({ fields });  // createGroup 인자 초안 | { error: "COMPANY_REQUIRED" }
export { analyze, match, draftGroup } from "@team-apple/hande-ai";
export type { ReportField, AnalyzeResult, MatchCandidate, GroupDraft } from "@team-apple/hande-ai";
