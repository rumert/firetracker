import React from 'react'
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
import { login } from '@/lib/utils/auth'
import { redirect } from 'next/navigation'

export default function page() {

    async function signIn (formData: FormData) {
        "use server";
    
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        let redirectPath: string | null;

        try {
            await login(email, password)
            redirectPath = '/'
        } catch (error) {
            console.log(error)
            redirectPath = null
        }
        redirectPath && redirect(redirectPath)
    };

  return (
    <main className='flex justify-center items-center h-screen w-screen'>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login/Sign Up</CardTitle>
                <CardDescription>
                Enter your credentials below to login/register to your account.
                </CardDescription>
            </CardHeader>
            <form action={signIn}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            name="email"
                            placeholder="m@example.com" 
                            required 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            name="password"
                            required 
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton
                      pendingText="Please wait..."
                      className='w-full'
                    >
                      Login/Sign Up
                    </SubmitButton> 
                </CardFooter>
            </form>    
        </Card>
    </main>
    
  )
}
