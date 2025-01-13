'use client'
import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SubmitButton from '@/components/ui/SubmitButton'
import { useRouter } from 'next/navigation'
import { loginValidation } from '@/lib/utils/formValidations'
import Link from 'next/link'

interface ILoginForm {
    nickname: string;
    password: string;
}
type ILoginErrorResponse = { error: string }

export default function page() {

    const [form, setForm] = useState<ILoginForm>({
        nickname: '',
        password: '',
    });
    const [errorMes, setErrorMes] = useState('');
    const router = useRouter()

    async function login(event: React.FormEvent) {
        event.preventDefault();
        const validationErr = loginValidation(form.nickname, form.password)
        if (validationErr) {
            setErrorMes(validationErr)
        } else {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(form),
                    credentials: 'include'
                });
                if (res.ok) {
                    router.push('/')
                } else {
                    const resData: ILoginErrorResponse = await res.json()
                    setErrorMes(resData.error)
                }
            } catch (error) {
                setErrorMes('Internal Server Error')
            }
        }
    }

  return (
    <main className='flex justify-center items-center h-screen w-screen'>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                Enter your credentials below to login.
                </CardDescription>
            </CardHeader>
            <form onSubmit={login}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input 
                            value={form.nickname}
                            onChange={e => {
                                setForm({
                                  ...form,
                                  nickname: e.target.value
                                });
                            }}
                            id="nickname" 
                            type="text" 
                            autoFocus={true}
                            required 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            value={form.password}
                            onChange={e => {
                                setForm({
                                  ...form,
                                  password: e.target.value
                                });
                            }}
                            id="password" 
                            type="password" 
                            required
                        />
                    </div>
                    <p className='text-destructive'>{errorMes}</p>
                </CardContent>
                <CardFooter>
                    <SubmitButton
                      pendingText="Please wait..."
                      className='w-full'
                    >
                      Login
                    </SubmitButton> 
                </CardFooter>
                <p className='text-center pb-2'>Not a member? <Link href='/register' className='text-primary'>Sign Up</Link></p>
            </form>    
        </Card>
    </main>
    
  )
}
