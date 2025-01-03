'use client'
import { createTransaction } from '@/services/transactionService'
import React from 'react'

export default function page() {

  async function test(e: any) {
    e.preventDefault()
    console.log(await createTransaction('67725e8be8e1005355516a45', {
      date: new Date('2023-10-25').toDateString(),
      title: 'testTransaction',
      amount: 5,
      type: 'expense',
    }))
  }
  
  return (
    <button onClick={test}>test</button>
  )
}
