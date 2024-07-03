import fetchWithTokens from '@/lib/utils/fetchWithTokens';
import { redirect } from 'next/navigation';
import React from 'react'
import { BudgetPopover } from './(top)/BudgetPopover';
import CreateBudget from './(top)/CreateBudget';
import BalanceCard from './(top)/BalanceCard';
import BudgetTables from './(table)/BudgetTables';
import Transactions from './(transactions)/Transactions';

async function getBudget(budgetId: any) {
  try {
    const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getBudgetList`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ budgetId })
    });
    return await response.json()
  } catch (error) {
    console.log(error)
  }
}

async function getTransactions(budgetId: any) {
  try {
    const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getTransactionList`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ budgetId })
    });
    return await response.json()
  } catch (error) {
    console.log(error)
  }
}

export default async function page({ params }: any) {
  const { primaryBudget, budgets } = await getBudget(params.budget)
  const { transactions } = await getTransactions(params.budget)

  return !primaryBudget ? redirect('/') :
    (
    <main>
      <div className='flex gap-20 px-20 py-6 sticky top-0 bg-background z-20'>
        <div className='flex gap-2'>
          <BudgetPopover budgets={budgets} primaryBudget={primaryBudget} />
          <CreateBudget />
        </div>
        <BalanceCard balance={primaryBudget.current_balance} />
      </div>
      <div className='flex'>
        { transactions?.length === 0 ? 
          <p className='mt-20 mx-auto text-3xl'>No Transactions Yet</p> :
          <BudgetTables transactions={transactions} />
        }   
        <div className='w-[390px] p-4'></div>
      </div>
      <Transactions transactions={transactions} budgetId={params.budget} />
    </main>  
    ) 
}
