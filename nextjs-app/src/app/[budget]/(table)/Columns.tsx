"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, PenLine } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Transaction, TransactionUpdateEdits } from "@/lib/types/transaction"
import { updateTransaction } from "@/services/transactionService"

export const getColumns = <TData extends Transaction>(category: string): ColumnDef<TData>[] => {
  const allCategories = ["Clothing", "Dining", "Education", "Entertainment", "Groceries", "Healthcare", "Hobbies", "Utilities", "Transportation", "Travel"]
  const router = useRouter()

  async function handleTransaction(transactionId: string, edits: TransactionUpdateEdits) {
    await updateTransaction(transactionId, edits)
    router.refresh()
  }

  return([
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          data-cy='tableTitle'
        >
          {category}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [isEditing, setIsEditing] = useState(false)
      const [title, setTitle] = useState(row.original.title)
      return isEditing ? (
        <Input 
        className="w-24" 
        placeholder={title} 
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && title != '' && handleTransaction(
          row.original._id,
          { title }
        )}
        onBlur={() => title != '' && handleTransaction(
          row.original._id,
          { title }
        )}
        data-cy='titleInputCy'
        />
      ) : (
        <Button className="hover:bg-transparent" variant='ghost' onClick={() => setIsEditing(true)} data-cy='titleButtonCy'>
          <h2 data-cy='transactionTitleInDT'>{title}</h2>
          <PenLine className="h-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amountt = parseFloat(row.getValue("amount"))
      const formatted= new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amountt)

      const [isEditing, setIsEditing] = useState(false)
      const [amount, setAmount]: any = useState(formatted)
      return isEditing ? (
        <div className="w-full flex justify-end">
          <Input 
          className="w-24"
          type="number"
          min="0"
          value={amount}
          placeholder={amount} 
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && amount > 0 && handleTransaction(
            row.original._id,
            row.original.type === 'income' ? { amount } : { amount: -amount }, 
          )}
          onBlur={() => amount > 0 && handleTransaction(
            row.original._id,
            row.original.type === 'income' ? { amount } : { amount: -amount },
          )}
          data-cy='amountInputCy'
          />
        </div>
      ) : (
        <div className="w-full flex justify-end">
          <Button className="hover:bg-transparent" variant='ghost' onClick={() => setIsEditing(true)} data-cy='amountButtonCy'>
            <h2 className="font-medium" data-cy='transactionAmountInDT'>{amount}</h2>
            <PenLine className="h-4" />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      const month = date.toLocaleString('default', { month: 'short' })
      const day = date.getDate()
      return <div className="text-right font-medium">{month}/{day}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
 
      return row.original.type === 'expense' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" data-cy='openDropdown'>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-cy='categoryList'>
                Change Category
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup 
                value={category} 
                onValueChange={(e) => handleTransaction(
                  row.original._id,
                  { category : e }
                )}>
                  { allCategories.map((cat: any, index: any) => {
                    return (
                    <DropdownMenuRadioItem value={cat} key={index} data-cy={cat === 'Dining' ? 'categoryToTest' : ''}>
                      {cat}
                    </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
])}
