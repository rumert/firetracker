import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Nickname from './Nickname'
import { cookies } from 'next/headers';
import { getNickname } from '@/services/userService';
import Password from './Password';
import { Separator } from '@radix-ui/react-dropdown-menu';

export default async function page({ searchParams }: { searchParams: { errorMes: string } }) {

  const token = cookies().get("access_token")?.value;
  const nickname = await getNickname(token)

  return (
    <main className='flex justify-center items-center h-screen w-screen'>
      <Card className="w-full max-w-sm">
        <CardContent>
          <h1 className="text-2xl py-4">Basic Information</h1>
          <Nickname currentNickname={nickname} />
          <Separator />
          Password & Security
        </CardContent> 
        <CardFooter>
          I am footer
        </CardFooter>
      </Card>
    </main>
    
  )
}
