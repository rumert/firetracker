import { CircleCheck, CircleX } from 'lucide-react'
import React from 'react'

export default function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className='w-40 h-10 px-4 bg-secondary rounded-lg flex justify-between items-center'>
      <p className='text-2xl' data-cy='balance'><span className='text-gray-500'>$ </span>{balance}</p>
      { balance >= 0 ? <CircleCheck className='text-green-600' /> : <CircleX className='text-destructive' />}
    </div>
  )
}
