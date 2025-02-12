'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import { updateNickname } from '@/services/userService'
import React, { useState } from 'react'

interface Props {
  currentNickname: string
}

export default function Nickname({ currentNickname }: Props) {
    const [newNickname, setNewNickname] = useState('')
    const [error, setError] = useState('')
    const [nickname, setNickname] = useState(currentNickname)

    async function handleNickname(e: React.FormEvent) {
      e.preventDefault();
      try {
        const res = await updateNickname(newNickname)
        setNickname(res.newNickname)
        setNewNickname('')
      } catch (error: any) {
        setError(error.message)
      }
    }

  return (
    <form onSubmit={handleNickname} className="space-y-4 p-6 border-b">
      <h2 className="text-xl font-semibold">Nickname</h2>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nickname" className="text-right">
          New Nickname:
        </Label>
        <Input
          id="nickname"
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          className="col-span-2"
          placeholder={nickname}
          required
        />
      </div>
      <p className='text-destructive'>{error}</p>
      <div className="flex justify-end">
        <SubmitButton pendingText="Please wait...">Save Changes</SubmitButton>
      </div>
    </form>
  )
}
