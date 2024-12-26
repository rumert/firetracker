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
import { signUpValidation } from '@/lib/utils/formValidation'

export default function page({ searchParams }: { searchParams: { message: string } }) {

    async function signIn (formData: FormData) {
        "use server";
    
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const validationError = signUpValidation(email, password)
        if (!validationError) {
            return redirect(`/login?message=${validationError}`)
        }
        let redirectPath: string | null;

        try {
            await login(email, password)
            redirectPath = '/'
        } catch (errorMes: any) {
            console.log(errorMes)
            redirectPath = `/login?message=${errorMes}`
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
                            type="text" 
                            name="email"
                            placeholder="m@example.com" 
                            autoFocus={true}
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
                    <p className='text-destructive'>{searchParams.message}</p>
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
