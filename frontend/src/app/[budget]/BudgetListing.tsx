import React from 'react'
import { DataTable } from './DataTable'
import { columns } from './Columns'

export default async function BudgetListing({ data }: any) {
  return (
    <div className="container mx-auto py-10 max-w-[768px]">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
