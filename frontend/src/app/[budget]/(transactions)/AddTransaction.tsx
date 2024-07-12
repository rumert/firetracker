"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from 'react'
import { addTransaction } from '@/app/actions'
import { useParams, useRouter } from 'next/navigation'
import SubmitButton from '@/components/ui/SubmitButton'
import { useFormState } from 'react-dom'

export default function AddTransaction() {
    const [isDialogActive, setIsDialogActive] = useState(false) 
    const router = useRouter()  
    const [error, setError] = useState('')

    const today = (new Date())
    today.setHours(0, 0, 0, 0)
    const [date, setDate] = useState(today) 
    const [type, setType] = useState('expense')

    const params: { budget: string } = useParams()
    const addTransactionWithOtherVars = addTransaction.bind(null, date, params.budget)
    const [formState, formAction] = useFormState(addTransactionWithOtherVars, {message: 'initial'})

    useEffect(() => {
        if (formState.message === 'success') {
            setIsDialogActive(false)
            router.refresh()
        } else if (formState.message === 'failed') {
            setError('an error occured, please try again.')
        }
    }, [formState])

  return (
    <div className='flex justify-end p-4 lg:p-8'>
        <Dialog open={isDialogActive} onOpenChange={setIsDialogActive} data-cy='addTransactionCard'>
            <DialogTrigger asChild>
                <Button className='px-3' data-cy='addTransactionButton'><Plus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={formAction}>
                    <DialogHeader>
                        <DialogTitle className='pb-1'>Add Transaction</DialogTitle>
                        <RadioGroup 
                        name='type'
                        onValueChange={setType}
                        defaultValue="expense" 
                        className='flex'
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                value="income" 
                                id="r1" 
                                />
                                <Label htmlFor="r1">Income</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                value="expense" 
                                id="r2" 
                                className='text-destructive border-destructive'
                                />
                                <Label htmlFor="r2">Expense</Label>
                            </div>
                        </RadioGroup>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                {type === "expense" ? "Where Did You Spent?" : "Where Did You Earn?"}
                            </Label>
                            <Input
                            id="title"
                            name='title'
                            className="col-span-3"
                            required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount ($)
                            </Label>
                            <Input
                            id="amount"
                            name='amount'
                            className="col-span-3"
                            type='number'
                            min="1"
                            required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor='date' className="text-right">
                                Date
                            </Label>
                            <Popover>
                                <PopoverTrigger id='date' asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(e) => e ? setDate(e) : ''}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter className='flex justify-end items-center gap-2'>
                        <p className='text-destructive underline'>{error}</p>
                        <SubmitButton>
                            Add
                        </SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  )
}



