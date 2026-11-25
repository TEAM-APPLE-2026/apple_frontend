// @team-apple/hande-ai(v0.4.0)는 타입 선언이 없어서, README의 "약속(인터페이스)"을 기준으로 필요한 부분만 적는다.
// hande-ai 버전을 올리면 이 파일도 함께 확인할 것.
declare module "@team-apple/hande-ai" {
  export type FieldKey = "company" | "type" | "notice_date" | "leaked" | "secondary" | "card" | "secondary_detail";
  export type FieldValue = string | string[] | { from: string; to: string; precision: "day" | "month" | "year" };
  export type ReportField = {
    key: FieldKey;
    aiValue: FieldValue | null;
    quote: string | null;
    userValue: FieldValue | null;
    source: "ai" | "user";
    needsCheck: boolean;
  };
  export type Report = { fields: ReportField[] } | ReportField[];

  export type MatchGroup = {
    id: string;
    name: string;
    company: string;
    harmType: "privacy_leak";
    status?: string;
    description?: string;
    conditions?: string;
    periodStart: string | null;
    periodEnd: string | null;
  };
  export type MatchCandidate = {
    groupId: string;
    score: number;
    level: "same" | "similar";
    matches: string[];
    diffs: string[];
  };

  export type AnalyzeResult =
    | { data: { fields: ReportField[]; warnings: string[]; candidates?: MatchCandidate[] } }
    | { error: { code: "AI_TIMEOUT" | "AI_FAILED" | "INVALID_INPUT"; message: string } };

  export type GroupDraft = {
    name: string;
    company: string;
    harmType: "privacy_leak";
    description: string;
    conditions: string;
    periodStart: string | null;
    periodEnd: string | null;
    requiredEvidence: string[];
    needsCheck: string[];
  };

  export function analyze(
    text: string,
    options?: { timeoutMs?: number; now?: Date; groups?: MatchGroup[] },
  ): Promise<AnalyzeResult>;
  export function match(report: Report, groups: MatchGroup[]): MatchCandidate[];
  export function draftGroup(report: Report): GroupDraft | { error: "COMPANY_REQUIRED" };
}
