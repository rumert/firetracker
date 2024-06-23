import fetchWithTokens from '@/lib/utils/fetchWithTokens';
import { redirect } from 'next/navigation';
import React from 'react'
import { BudgetPopover } from './BudgetPopover';
import CreateBudget from './CreateBudget';
import BalanceCard from './BalanceCard';
import BudgetListing from './BudgetListing';
import Transactions from './Transactions';
import { Transaction } from './Columns';

export default async function page({ params }: any) {
    let primaryBudget = undefined
    let budgets = []
    try {
        const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getBudgetList`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ budgetId: params.budget })
        });
        const data = await response.json();
        primaryBudget = data.primaryBudget
        budgets = data.budgets
    } catch (error) {
        console.log(error)
    }

    async function getData(): Promise<Transaction[]> {
        return [
          {
            id: '1',
            category: 'c',
            planned: 10,
            spent: 5
          },
          {
            id: '2',
            category: 'a',
            planned: 20,
            spent: 10
          },
          {
            id: '3',
            category: 'bsd',
            planned: 30,
            spent: 20
          },
          {
            id: '4',
            category: 'd',
            planned: 40,
            spent: 30
          },
        ]
    }
    const data = await getData()

  return !primaryBudget ? redirect('/') :
    (
    <main className='h-screen w-screen flex flex-col'>
        <div className='flex justify-between items-center p-6 lg:p-12'>
            <div className='flex gap-20'>
                <div className='flex gap-2'>
                    <BudgetPopover budgets={budgets} primaryBudget={primaryBudget} />
                    <CreateBudget />
                </div>
                <BalanceCard balance={primaryBudget.current_balance} />
            </div>
        </div>
        <div className='flex h-full p-2'>   
            <BudgetListing data={data}/>
            <Transactions />
        </div>
    </main>  
    ) 
}
