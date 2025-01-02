'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import SubmitButton from '@/components/ui/SubmitButton'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBudgetValidation } from '@/lib/utils/formValidations'
import { CreateBudgetForm } from '@/lib/types/budget'
import { createBudget } from '@/services/budgetService'

interface Props {
    isFirst: boolean
    setIsAddBudgetActive?: (value: boolean) => void
}

export default function AddBudget({ 
    isFirst, 
    setIsAddBudgetActive 
}: Props) {
    const [form, setForm] = useState<CreateBudgetForm>({
        name: '',
        baseBalance: 0,
    });
    const [errorMes, setErrorMes] = useState('');
    const router = useRouter()

    async function addBudget(event: React.FormEvent) {
        event.preventDefault();
        const validationErr = createBudgetValidation(form.name, form.baseBalance)
        if (validationErr) {
            setErrorMes(validationErr)
        } else {
            try {
                const { _id: budgetId } = await createBudget({
                    name: form.name,
                    base_balance: form.baseBalance,
                    is_default: isFirst
                })
                console.log('BID: ', budgetId)
                //resData !== 'OK' ? setErrorMes(resData.error) : router.push('/')
            } catch (error) {
                setErrorMes('Internal Server Error')
            }
        }
    }
  
  return (
    <form onSubmit={addBudget} className='h-screen w-screen flex justify-center items-center absolute top-0 left-0 z-50 bg-background' data-cy='addBudget'>
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
                <p className='text-destructive'>{errorMes}</p>
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
