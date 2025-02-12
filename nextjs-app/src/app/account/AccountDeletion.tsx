'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import { deleteAccount } from '@/services/userService'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function AccountDeletion() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleAccountDeletion(e: React.FormEvent) {
        e.preventDefault();
        try {
            await deleteAccount(password)
            router.push('/login')
        } catch (error: any) {
            setError(error.message)
        }
    }

  return (
    <form onSubmit={handleAccountDeletion} className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Delete Account</h2>
        <p className="text-destructive text-sm mb-4">
            This action cannot be undone. All your data will be permanently removed.
        </p>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="delete" className="text-right">
                Your Password:
            </Label>
            <Input
                id="delete"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-2"
                required
            />
        </div>
        <p className='text-destructive'>{error}</p>
        <div className="flex justify-end">
            <SubmitButton 
            variant="destructive"
            className="text-white"
            pendingText='Please wait...'
            >
            Confirm Permanent Deletion
            </SubmitButton>
        </div>
    </form>
  )
}
