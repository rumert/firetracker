"use client"
import { ColumnDef } from "@tanstack/react-table"

export type Transaction = {
  id: string
  category: string
  planned: number
  spent: number
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "planned",
    header: "Planned",
  },
  {
    accessorKey: "spent",
    header: "Spent",
  },
]
