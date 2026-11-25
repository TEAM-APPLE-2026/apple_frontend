'use client'
import {useSearchParams} from 'next/navigation'
import {GroupDetail} from '@/features/live/Groups'
export default function GroupView(){
 const id=useSearchParams().get('id')??''
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return <p>올바른 사건 주소로 접속해 주세요.</p>
 return <GroupDetail id={id}/>
}
