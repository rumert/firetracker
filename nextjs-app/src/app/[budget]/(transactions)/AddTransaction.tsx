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
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SubmitButton from '@/components/ui/SubmitButton'
import { CreateTransactionForm } from '@/lib/types/transaction'
import { createTransaction } from '@/services/transactionService'
import { createTransactionValidation } from '@/lib/utils/formValidations'

export default function AddTransaction() {
    const params: { budget: string } = useParams()
    const [isDialogActive, setIsDialogActive] = useState(false) 
    const today = (new Date())
    today.setHours(0, 0, 0, 0)
    const [form, setForm] = useState<CreateTransactionForm>({
        date: today,
        title: '',
        amount: 0,
        type: 'expense',
    });
    const [error, setError] = useState('')
    const router = useRouter()
    
    async function addTransaction(event: React.FormEvent) {
        event.preventDefault();
        const validationErr = createTransactionValidation(form)
        if (validationErr) {
            setError(validationErr)
        } else {
            try {
                await createTransaction(params.budget, {
                    ...form,
                    amount: form.type === 'income' ? form.amount : -form.amount,
                    date: form.date.toDateString(),
                })
                setIsDialogActive(false)
                router.refresh()
            } catch (error) {
                setError('Internal Server Error')
            }
        }
    }

  return (
    <div className='flex justify-end p-4 lg:p-8'>
        <Dialog open={isDialogActive} onOpenChange={setIsDialogActive} data-cy='addTransactionCard'>
            <DialogTrigger asChild>
                <Button className='px-3' data-cy='addTransactionButton'><Plus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={addTransaction}>
                    <DialogHeader>
                        <DialogTitle className='pb-1'>Add Transaction</DialogTitle>
                        <RadioGroup 
                        name='type'
                        onValueChange={e => {
                            setForm({
                              ...form,
                              type: e
                            });
                        }}
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
                                {form.type === "expense" ? "Where Did You Spent?" : "Where Did You Earn?"}
                            </Label>
                            <Input
                            id="title"
                            onChange={e => {
                                setForm({
                                  ...form,
                                  title: e.target.value
                                });
                            }}
                            value={form.title}
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
                            onChange={e => {
                                setForm({
                                  ...form,
                                  amount: Number(e.target.value)
                                });
                            }}
                            min={0}
                            value={form.amount}
                            className="col-span-3"
                            type='number'
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
                                        !form.date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={form.date}
                                    onSelect={(e) => {
                                        if (e) {
                                            setForm({
                                                ...form,
                                                date: e
                                            });
                                        }
                                    }}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter className='flex justify-end items-center gap-2'>
                        <p className='text-destructive'>{error}</p>
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



