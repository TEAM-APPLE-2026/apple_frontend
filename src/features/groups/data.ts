import type { BadgeTone } from '@/components/common/Badge'
import { currentUser } from '@/lib/mock'

// 내 그룹 목업 데이터 (Figma U-21). 수치는 모두 [예시]입니다.

export type MyGroup = {
  id: string
  title: string
  badge: { label: string; tone: BadgeTone }
  meta: string
  metaNote?: string
  progress: string
  todo: string
}

export const NEW_GROUP_TITLE = '[예시] △△ 통신사 개인정보 유출 · 새 그룹'

export const MY_GROUPS: MyGroup[] = [
  {
    id: 'telecom', title: '[예시] △△ 통신사 고객정보 유출', badge: { label: '대응 연결 중', tone: 'blue' },
    meta: `닉네임 ${currentUser.nickname} · 합류 2026.10.20 · 214명 참여`, metaNote: '[예시 수치]',
    progress: '대응 방법 투표 중', todo: '대응 방법 투표하기',
  },
  {
    id: 'new', title: NEW_GROUP_TITLE, badge: { label: '모집 중', tone: 'line' },
    meta: `닉네임 ${currentUser.nickname} · 개설 2026.11.10`,
    progress: '참여 1명 · 대표자 선정까지 9명', todo: '링크 공유해서 함께할 사람 모으기',
  },
]

export const findMyGroup = (id: string) => MY_GROUPS.find((g) => g.id === id)
