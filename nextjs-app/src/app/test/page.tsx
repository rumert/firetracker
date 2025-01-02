'use client'
import { getTransactions, updateTransaction } from '@/services/transactionService'
import React from 'react'

export default function page() {

  async function test(e: any) {
    e.preventDefault()
    console.log(await getTransactions('67725e8be8e1005355516a45'))
  }
  
  return (
    <button onClick={test}>test</button>
  )
}
