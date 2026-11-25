import { backend } from '@/lib/backend'

export type ApiResult<T> = { data: T; error?: never } | { error: { code: string; message: string }; data?: never }
export type Profile = { profile: { id: string; role: 'user' | 'firm'; nickname: string }; firm: Firm | null }
export type Firm = { id: string; firmName: string; repName: string | null; openDate: string | null; approvalStatus: string; bizStatus: string; bizValid: string; rejectReason: string | null }
export type BusinessCheck = { firmId: string; bizStatus: string; bizValid: string; approvalStatus: string }
export type Group = { id: string; name: string; company: string; harmType: 'privacy_leak'; description: string; conditions: string; status: string; subStatus: string; memberCount: number; periodStart: string | null; periodEnd: string | null; requiredEvidence: string[] }
export type Page<T> = { items: T[]; nextCursor: string | null }
export type Receipt = { reportId: string; status: string }
// Boundary types follow backend integration-contract.md. Keep the supplied client.mjs unchanged.
export class BackendError extends Error { constructor(public code:string,message:string){super(message)} }
export async function call<T>(method: string, input?: unknown): Promise<T> {
  const client = backend as unknown as Record<string, (input?: unknown) => Promise<ApiResult<T>>>
  const result = await client[method](input)
  if (result.error) throw new BackendError(result.error.code,result.error.message)
  return result.data
}
