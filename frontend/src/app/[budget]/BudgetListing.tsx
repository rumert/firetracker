import React from 'react'
import { DataTable } from './DataTable'
import { Transaction, columns } from './Columns'

async function getData(): Promise<Transaction[]> {
    // Fetch data from your API here.
    return [
      {
        id: '123',
        category: '123',
        planned: 10,
        spent: 5
      },
      // ...
    ]
}

export default async function BudgetListing() {
    const data = await getData()
  return (
    <div className="container mx-auto py-10 max-w-[768px]">
        <DataTable columns={columns} data={data} />
    </div>
  )
}
