import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function Avatar() {

    async function logOut() {
        'use server'
        cookies().delete('access_token')
        cookies().delete('refresh_token')
        redirect('/login')
    }

  return (
    <DropdownMenu>
        <div className='-mr-10 lg:-mr-6'>
            <DropdownMenuTrigger asChild>
                <Button className='px-3' variant="secondary">
                    <UserRound />
                </Button>
            </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent>
            <DropdownMenuItem>
                <Link href='/account'>Account Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <form action={logOut}>
                    <button>
                        Log Out
                    </button>
                </form>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}