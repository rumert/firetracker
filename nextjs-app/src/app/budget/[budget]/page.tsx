import { redirect } from 'next/navigation';
import React from 'react'
import { BudgetPopover } from './(top)/BudgetPopover';
import CreateBudget from './(top)/CreateBudget';
import BalanceCard from './(top)/BalanceCard';
import BudgetTables from './(table)/BudgetTables';
import Transactions from './(transactions)/Transactions';
import Image from 'next/image';
import { getBudget, getBudgets } from '@/services/budgetService';
import { getTransactions } from '@/services/transactionService';
import { cookies } from 'next/headers';
import Avatar from '../../../components/Avatar';
import Link from 'next/link';

export default async function page({ params }: { params: { budget: string } }) {
  const token = cookies().get("access_token")?.value;
  
  const currentBudget = await getBudget(params.budget, token)
  const budgets = await getBudgets(token)
  const transactions = await getTransactions(params.budget, token)

  return (!currentBudget || !transactions) ? redirect('/') :
    (
    <main>
      <div className='flex justify-between gap-20 px-20 py-6 sticky top-0 bg-background z-20'>
        <div className='flex gap-8'>
          <div className='flex gap-2'>
            <Link href='/' className='relative h-10 w-10'>
              <Image
              src='/logo.png'
              width='100'
              height='100'
              alt='icon'
              />
            </Link>
            <BudgetPopover budgets={budgets} currentBudget={currentBudget} />
            <CreateBudget />
          </div>
          <BalanceCard balance={currentBudget.current_balance} />
        </div>
        <Avatar />
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
