'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateNickname } from '@/services/userService'
import { PenLine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function Nickname({ currentNickname }: { currentNickname: string }) {
    const router = useRouter()
    const [nickname, setNickname] = useState<string>(currentNickname)
    const [isEditingNickname, setIsEditingNickname] = useState(false)

    async function handleNickname() {
      try {
        await updateNickname(nickname)
        setIsEditingNickname(false)
        router.push('/account')
      } catch (error: any) {
        router.push(`/account?errorMes=${error.message}`)
      }  
    }
  return ( 
    <div>
      <Label htmlFor="nickname">Nickname</Label>
      <div className='flex items-center'>
        <Input
        id="nickname"
        className="w-40"
        placeholder={nickname}
        disabled={!isEditingNickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && nickname != '' && handleNickname()}
        onBlur={() => nickname != '' && handleNickname()}
        />
        <button onClick={() => setIsEditingNickname(!isEditingNickname)}><PenLine className="h-4" /></button>
      </div> 
    </div>
    
  )
}
