import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import fetchWithTokens from '@/lib/utils/fetchWithTokens'
import { redirect } from 'next/navigation'

export default function AddBudget({ isFirst }: any) {

    async function createBudget(formData: FormData) {
        "use server"

        const name = formData.get("name") as string;
        const baseBalance = formData.get("baseBalance") as string;
        let redirectPath = undefined;

        try {
            const response = await fetchWithTokens(`${process.env.NODE_API_URL}/createBudget`, {
              method: 'POST',
              headers: {
                'Content-type': 'application/json'
              },
              body: JSON.stringify({ name, baseBalance, isDefault: isFirst })
            });
            const { budget } = await response.json()
            redirectPath = `/${budget._id}`
        } catch (error) {
            console.log(error)
        }
        
        redirectPath ? redirect(redirectPath) : ''
    }
  
  return (
    <form action={createBudget} className='h-screen w-screen flex justify-center items-center'>
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create budget</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name" className='font-normal'>Budget Name</Label>
                        <Input 
                            id="name" 
                            name="name"
                            required 
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="baseBalance" className='font-normal'>Base Balance ( $ )</Label>
                        <Input 
                            id="baseBalance" 
                            type="number" 
                            name="baseBalance"
                            required 
                        />
                    </div>
                </div>       
            </CardContent>
            <CardFooter className="flex justify-start">
                <SubmitButton
                  pendingText="Creating..."
                >
                  Create
                </SubmitButton> 
            </CardFooter>
        </Card>
    </form>
  )
}
