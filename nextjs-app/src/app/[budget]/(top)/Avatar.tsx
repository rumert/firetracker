import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Avatar() {

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button className='px-3' data-testid='addTransactionButton' variant="secondary">
                <UserRound />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem>
                Log Out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
  
}