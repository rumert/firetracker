'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IPasswordForm } from '@/lib/types/auth';
import React, { useState } from 'react'

export default function Password() {

    const [passwordForm, setPasswordForm] = useState<IPasswordForm>({
        currentPass: '',
        newPass: '',
        reNewPass: '',
    });

    async function handlePassword() {
        if (passwordForm.newPass !== passwordForm.reNewPass) {
            console.log("1")
        }
        console.log("2")
    }

  return (
    <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1'>
            <Label htmlFor="currentPass">Current Password</Label>
            <Input
            id="currentPass"
            className="w-40"
            placeholder={passwordForm.currentPass}
            onChange={(e) => setPasswordForm({
                ...passwordForm,
                currentPass: e.target.value,
            })}
            />
        </div>
        <div className='flex items-center gap-4'>
            <div className='flex flex-col gap-1'>
                <Label htmlFor="newPass">New Password</Label>
                <Input
                id="newPass"
                className="w-40"
                placeholder={passwordForm.newPass}
                onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPass: e.target.value,
                })}
                />
            </div>

            <div className='flex flex-col gap-1'>
                <Label htmlFor="reNewPass">Confirm New Password</Label>
                <Input
                id="reNewPass"
                className="w-40"
                placeholder={passwordForm.reNewPass}
                onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    reNewPass: e.target.value,
                })}
                />
            </div>
        </div>
    </div>
     
  )
}
