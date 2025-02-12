'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import { updatePassword } from '@/services/userService'
import React, { useState } from 'react'

export default function Password() {
    const emptyForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('')

  async function handlePass(e: React.FormEvent) {
    e.preventDefault();
    try {
        await updatePassword(form.currentPassword, form.newPassword)
        setForm(emptyForm)
    } catch (error: any) {
        setError(error.message)
    }
  }

  return (
    <form onSubmit={handlePass} className="space-y-4 p-6 border-b">
        <h2 className="text-xl font-semibold">Password</h2>
        <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right">
                    Current Password:
                </Label>
                <Input
                id="current"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({
                    ...form,
                    currentPassword: e.target.value,
                })}
                className="col-span-2"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new" className="text-right">
                New Password:
                </Label>
                <Input
                id="new"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({
                    ...form,
                    newPassword: e.target.value,
                })}
                className="col-span-2"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirm" className="text-right">
                Confirm Password:
                </Label>
                <Input
                id="confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({
                    ...form,
                    confirmPassword: e.target.value,
                })}
                className="col-span-2"
                required
                />
            </div>
            <p className='text-destructive'>{error}</p>
            <div className="flex justify-end">
                <SubmitButton
                    disabled={(form.newPassword !== form.confirmPassword) || form.newPassword == ''}
                    pendingText='Please wait...'
                >
                    Update Password
                </SubmitButton>
            </div>
        </div>
    </form>
  )
}
