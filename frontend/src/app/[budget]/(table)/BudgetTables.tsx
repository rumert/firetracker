import React from 'react'
import { DataTable } from './DataTable'

export default async function BudgetTables({ transactions }: any) {

  const categorizedTransactions = transactions.reduce((acc: any, transaction: any) => {
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
