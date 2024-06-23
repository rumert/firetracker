"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function BudgetPopover({ budgets, primaryBudget }: any) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(primaryBudget.name)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          { name }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search budget..." />
          <CommandList>
            <CommandEmpty>No budget found.</CommandEmpty>
            <CommandGroup>
              {budgets.map((budget: any, index: any) => (
                <Link href={`/${budget._id}`} key={index}>
                  <CommandItem
                    value={budget.name}
                    onSelect={(currentName) => {
                      setName(currentName === name ? "" : currentName)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        name === budget.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {budget.name}
                    {budget.is_default && <Badge variant="secondary" className="ml-auto">Primary</Badge>}
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
