import React from 'react'
import { DataTable } from './DataTable'
import { Transaction } from '@/lib/types/transaction';

export default async function BudgetTables({ transactions }: { transactions: [Transaction] }) {

  const categorizedTransactions: any = transactions?.reduce((acc: any, transaction) => {
    const { category } = transaction;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(transaction);
    return acc;
  }, {});

  return (
    <div className="mx-auto p-8 w-2/3 max-w-[768px]">
      {Object.keys(categorizedTransactions).map((category) => (
        <DataTable transactions={categorizedTransactions[category]} key={category} category={category} />
      ))}
    </div>
  )
}
