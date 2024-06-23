import fetchWithTokens from '@/lib/utils/fetchWithTokens';
import { redirect } from 'next/navigation';
import React from 'react'
import { BudgetPopover } from './BudgetPopover';
import CreateBudget from './CreateBudget';
import BalanceCard from './BalanceCard';
import BudgetListing from './BudgetListing';
import Transactions from './Transactions';

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
            <BudgetListing />
            <Transactions />
        </div>
    </main>  
    ) 
}
