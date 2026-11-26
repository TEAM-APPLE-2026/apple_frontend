'use client'

import { useState, type FormEvent } from 'react'
import { developmentBackend, DEV_PROJECT } from '@/lib/dev-backend'

type Result = { error?: { code: string; message: string }; data?: unknown }
type Evidence = { evidenceId: string; objectPath: string; status: string; originalName: string }
const kinds = { notice: '유출 안내', smishing: '스미싱', payment: '결제 자료', other: '기타' }

export default function DevelopmentConnection() {
  const [message, setMessage] = useState('개발 계정으로 로그인해 주세요. 기존 시연 화면과 별도로 실제 개발 DB를 사용합니다.')
  const [busy, setBusy] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [reportId, setReportId] = useState('')
  const [rawText, setRawText] = useState('')
  const [company, setCompany] = useState('')
  const [kind, setKind] = useState<keyof typeof kinds>('notice')
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [retryPaths, setRetryPaths] = useState<string[]>([])
  const [output, setOutput] = useState('')

  const unwrap = (r: Result) => {
    if (r.error) throw new Error(`${r.error.code}: ${r.error.message}`)
    return r.data
  }
  const run = async (job: () => Promise<void>) => {
    if (busy) return
    setBusy(true)
    try { await job() } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패. 다시 시도해 주세요.') }
    finally { setBusy(false) }
  }
  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void run(async () => {
      const { api } = developmentBackend()
      unwrap(await api.signIn({ email: String(form.get('email')), password: String(form.get('password')) }))
      const profile = await api.getMyProfile()
      if (profile.error) { await api.signOut(); throw new Error(profile.error.message) }
      setRole(profile.data.profile.role)
      setReportId(''); setEvidences([]); setRetryPaths([]); setOutput('')
      setMessage(`로그인 완료 · ${profile.data.profile.role === 'firm' ? '로펌' : '피해자'} 계정`)
    })
  }
  const save = () => run(async () => {
    const { api } = developmentBackend()
    // Manual values are explicitly user-provided; no demo AI output is stored as an AI result.
    const fields = ['company', 'type', 'notice_date', 'leaked', 'secondary', 'card'].map((key) => ({
      key, aiValue: null, quote: null, userValue: key === 'company' ? company.trim() : key === 'type' ? 'privacy_leak' : null,
      source: key === 'company' || key === 'type' ? 'user' : 'ai', needsCheck: !['company', 'type'].includes(key),
    }))
    const result = await api.saveReport({ reportId: reportId || null, rawText, fields })
    if (result.error) throw new Error(result.error.message)
    setReportId(result.data.reportId)
    unwrap(await api.getReport({ reportId: result.data.reportId }))
    setMessage('사례 저장·재조회 완료. 아래에서 실제 증빙을 업로드할 수 있습니다.')
  })
  const upload = (file: File | undefined) => run(async () => {
    if (!file || !reportId) return
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) || file.size < 1 || file.size > 10_000_000)
      throw new Error('JPG·PNG·PDF, 파일당 10MB 이하만 선택해 주세요.')
    const { api, supabase } = developmentBackend()
    const registered = await api.createEvidenceUpload({ reportId, kind, originalName: file.name, mimeType: file.type, sizeBytes: file.size })
    if (registered.error) throw new Error(registered.error.message)
    const row = registered.data
    setEvidences((items) => [...items, { ...row, status: 'pending' }])
    const uploaded = await supabase.storage.from(row.bucketId).upload(row.objectPath, file, { contentType: file.type, upsert: false })
    if (uploaded.error) throw new Error('업로드 실패. 남은 항목을 삭제한 뒤 다시 시도해 주세요.')
    const checked = await api.confirmEvidence({ evidenceId: row.evidenceId })
    if (checked.error) throw new Error(checked.error.message)
    setEvidences((items) => items.map((item) => item.evidenceId === row.evidenceId ? { ...item, status: checked.data.status } : item))
    setMessage(checked.data.status === 'ready' ? '서버가 파일을 검증했습니다.' : '실제 형식·크기 검증에 실패했습니다. 파일을 삭제하고 다시 선택해 주세요.')
  })
  const remove = (id: string) => run(async () => {
    const { api } = developmentBackend()
    const result = await api.deleteEvidence({ evidenceId: id })
    if (result.error) throw new Error(result.error.message)
    setEvidences((items) => items.filter((item) => item.evidenceId !== id))
    if (!result.data.objectRemoved) setRetryPaths((items) => [...items, result.data.objectPath])
    setMessage(result.data.objectRemoved ? '파일 삭제 완료' : '파일 삭제가 남아 있습니다. 삭제 재시도를 눌러 주세요.')
  })

  return <main style={{ maxWidth: 850, margin: '48px auto', padding: 24, lineHeight: 1.8 }}>
    <h1>개발 DB 연결 확인</h1>
    <p>대상: hande_dev · {DEV_PROJECT}</p>
    <p role="status">{message}</p>
    {!role ? <form onSubmit={login} style={{ display: 'grid', gap: 12 }}>
      <label>이메일 <input name="email" type="email" required autoComplete="username" /></label>
      <label>비밀번호 <input name="password" type="password" required autoComplete="current-password" /></label>
      <button disabled={busy}>로그인·프로필 확인</button>
    </form> : <>
      <button disabled={busy} onClick={() => void run(async () => { unwrap(await developmentBackend().api.signOut()); setRole(null); setReportId(''); setEvidences([]); setOutput(''); setMessage('로그아웃했습니다.') })}>로그아웃</button>
      {role === 'user' && <section>
        <h2>사례 저장·증빙</h2>
        <label>기업명 <input value={company} onChange={(e) => setCompany(e.target.value)} /></label><br />
        <label>피해 내용 <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} /></label><br />
        <button disabled={busy || !company.trim() || !rawText.trim()} onClick={() => void save()}>사례 저장·재조회</button>
        {reportId && <>
          <p>저장된 사례: {reportId}</p>
          <label>자료 종류 <select value={kind} onChange={(e) => setKind(e.target.value as keyof typeof kinds)}>{Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><br />
          <label>증빙 파일 <input type="file" accept="image/jpeg,image/png,application/pdf" disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} /></label>
          <p>사례당 10개 · 제출 후 검증 완료 파일 삭제 불가 · 로펌 원본 조회 불가</p>
          <ul>{evidences.map((item) => <li key={item.evidenceId}>{item.originalName} · {item.status} <button disabled={busy} onClick={() => void run(async () => {
            const result = await developmentBackend().api.confirmEvidence({ evidenceId: item.evidenceId })
            if (result.error) throw new Error(result.error.message)
            setEvidences((items) => items.map((x) => x.evidenceId === item.evidenceId ? { ...x, status: result.data.status } : x))
            setMessage('파일 검증 결과를 다시 확인했습니다.')
          })}>검증 재시도</button> <button disabled={busy} onClick={() => void remove(item.evidenceId)}>삭제</button></li>)}</ul>
          {retryPaths.map((path) => <button key={path} disabled={busy} onClick={() => void run(async () => {
            const result = await developmentBackend().supabase.storage.from('evidences').remove([path])
            if (result.error) throw new Error('삭제에 실패했습니다. 다시 시도해 주세요.')
            setRetryPaths((items) => items.filter((x) => x !== path)); setMessage('파일 삭제 재시도 완료')
          })}>남은 파일 삭제 재시도</button>)}
        </>}
      </section>}
      {role === 'firm' && <section><h2>사업자 상태 확인</h2><p>등록된 로펌의 DB 사업자번호로 조회합니다. 계속사업자여도 로펌 승인 상태는 바뀌지 않습니다.</p>
        <button disabled={busy} onClick={() => void run(async () => {
          const api = developmentBackend().api
          const before = await api.getMyFirm(); unwrap(before)
          const verified = await api.verifyBusiness(); unwrap(verified)
          const after = await api.getMyFirm(); unwrap(after)
          if (before.data.approvalStatus !== after.data.approvalStatus) throw new Error('승인 상태가 변경되었습니다. 검토가 필요합니다.')
          setOutput(JSON.stringify(verified.data, null, 2)); setMessage('사업자 조회·승인 권한 분리 확인 완료')
        })}>국세청 조회·승인 상태 확인</button>
      </section>}
      <section><h2>실제 그룹 목록</h2><button disabled={busy} onClick={() => void run(async () => {
        const result = await developmentBackend().api.listGroups({}); unwrap(result)
        setOutput(JSON.stringify(result.data, null, 2)); setMessage('개발 DB 그룹 목록 조회 완료')
      })}>그룹 조회</button><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{output}</pre></section>
    </>}
  </main>
}
