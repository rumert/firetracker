'use client'
import { getDefaultBudget } from '@/services/budgetService'
import React from 'react'

export default function page() {
    async function test(e: any) {
    e.preventDefault()
    await getDefaultBudget()
    }
  return (
    <button onClick={test}>test</button>
  )
}
