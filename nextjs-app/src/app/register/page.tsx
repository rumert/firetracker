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
import { registerValidation } from '@/lib/utils/formValidations'
import Link from 'next/link'

interface IRegisterForm {
    nickname: string;
    email: string;
    password: string;
}
type IRegisterResponse = 'OK' | { error: string }

export default function page() {
    const [form, setForm] = useState<IRegisterForm>({
        nickname: '',
        email: '',
        password: '',
    });
    const [errorMes, setErrorMes] = useState('');
    const router = useRouter()

    async function register(event: React.FormEvent) {
        event.preventDefault();
        const validationErr = registerValidation(form.email, form.password)
        if (validationErr) {
            setErrorMes(validationErr)
        } else {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/register`, { 
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(form),
                    credentials: 'include'
                });
                const resData: IRegisterResponse = await res.json()
                if (resData === 'OK') {
                    router.push('/')
                } else {
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
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                Enter your credentials below to sign up.
                </CardDescription>
            </CardHeader>
            <form onSubmit={register}>
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
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            value={form.email}
                            onChange={e => {
                                setForm({
                                  ...form,
                                  email: e.target.value
                                });
                            }}
                            id="email" 
                            type="text" 
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
                      Sign Up
                    </SubmitButton> 
                </CardFooter>
                <p className='text-center pb-2'>Already a member? <Link href='/login' className='text-primary'>Login</Link></p>
            </form>    
        </Card>
    </main>
    
  )
}
