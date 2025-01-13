"use client"
import AddBudget from '@/components/AddBudget'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function CreateBudget() {
  const [isAddBudgetActive, setIsAddBudgetActive] = useState(false)
  return isAddBudgetActive ? (
    <AddBudget isFirst={false} setIsAddBudgetActive={setIsAddBudgetActive} />
  ) : (
    <Button variant="secondary" className="px-3" type="button" onClick={ () => setIsAddBudgetActive(true) } data-pw='createBudgetButton'>
      <Plus />
    </Button>
  )
}
