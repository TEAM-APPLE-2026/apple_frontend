'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createBackendClient } from './backend-client.mjs'

export const DEV_PROJECT = 'https://jnpbuulrmgdkzbiywjtd.supabase.co'
let client: SupabaseClient | undefined

/** The development integration screen never falls back to the production project. */
export function developmentBackend() {
  if (process.env.NODE_ENV === 'production') throw new Error('개발 연결 화면은 로컬 개발 서버에서만 사용할 수 있습니다.')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url !== DEV_PROJECT || !key) throw new Error('hande_dev URL과 공개 키 설정을 확인해 주세요.')
  let isPublic = key.startsWith('sb_publishable_')
  if (key.startsWith('eyJ')) {
    try {
      const encoded = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(encoded))
      isPublic = payload.role === 'anon' && payload.ref === 'jnpbuulrmgdkzbiywjtd'
    } catch { isPublic = false }
  }
  if (!isPublic) throw new Error('개발 프로젝트의 공개 anon/publishable 키만 허용합니다.')
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false } })
  return { supabase: client, api: createBackendClient(client) }
}
