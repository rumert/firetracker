import { CircleCheck } from 'lucide-react'
import React from 'react'

export default function BalanceCard({balance}: any) {
  return (
    <div className='w-40 h-10 px-4 bg-secondary rounded-lg flex justify-between items-center'>
        <p className='text-2xl'><span className='text-gray-500'>$</span>{balance}</p>
        <CircleCheck className='text-green-600' />
    </div>
  )
}
