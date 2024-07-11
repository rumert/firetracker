'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import { createBudget } from '@/app/actions'
import { X } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
    isFirst: boolean
    setIsAddBudgetActive?: (value: boolean) => void
}

export default function AddBudget({ isFirst, setIsAddBudgetActive }: Props) {

    const createBudgetWithIsFirst = createBudget.bind(null, isFirst)
  
  return (
    <form action={createBudgetWithIsFirst} className='h-screen w-screen flex justify-center items-center absolute top-0 left-0 z-50 bg-background' data-cy='addBudget'>
        <Card className="w-[350px]">
            <CardHeader className='relative'>
                <CardTitle>Create budget</CardTitle>
                {!isFirst && 
                <Button 
                onClick={() => setIsAddBudgetActive && setIsAddBudgetActive(false)} 
                className='w-fit px-2 absolute right-1.5 top-0' 
                variant='ghost' 
                type='button'
                data-cy='close'
                >
                    <X className='text-destructive' />
                </Button>
                }
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name" className='font-normal'>Budget Name</Label>
                        <Input 
                            id="name" 
                            name="name"
                            autoFocus={true}
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
