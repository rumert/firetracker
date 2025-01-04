import AddTransaction from "./AddTransaction";
import { Trash2 } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import { redirect } from "next/navigation";
import { Transaction } from "@/lib/types/transaction";
import { deleteTransaction } from "@/services/transactionService";
import { cookies } from "next/headers";
import { format } from "date-fns";

type props = {
  budgetId: string,
  transactions: Transaction[]
}

export default async function Transactions({ budgetId, transactions }: props) {

  async function removeTransaction(FormData: FormData) {
    "use server"
    const transactionId = FormData.get("transactionId") as string
    const token = cookies().get("access_token")?.value;
    let redirectPath: string | null;
    try {
      await deleteTransaction(transactionId, token);
      redirectPath = `/${budgetId}`
    } catch (error) {
      redirectPath = null
    } 
    redirectPath && redirect(redirectPath)
  }

  return (
    <div className='h-[calc(100vh-97px)] w-96 p-4 border-2 rounded-xl fixed top-[90px] right-2'>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl pl-12">Last Transactions</h1>
        <AddTransaction />
      </div>
      <section>
        { transactions.length != 0 &&
        <div className="h-16 pl-8 pr-2 pb-4 grid grid-cols-7 justify-center items-end text-center text-sm lg:text-lg font-semibold">
          <div className="col-span-2">
            <p>Title</p>
            <hr className="w-1/2 mx-auto" />
          </div>
          <div className="col-span-2">
            <p>Amount</p>
            <hr className="w-1/2 mx-auto" />
          </div>
          <div className="col-span-2">
            <p>Date</p>
            <hr className="w-1/2 mx-auto" />
          </div>
          <div></div>
        </div>
        }
        {transactions?.map((tr: Transaction, index: number) => {
          const date = new Date(tr.date);
          const formattedDate = format(date, 'MMM/dd')
          const formattedAmount= new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(tr.amount)
          //const year = date.getFullYear()
          return (
          <div key={index} className={`h-16 pl-8 pr-2 mb-1 grid grid-cols-7 place-items-center border ${tr.type === 'expense' ? 'border-destructive' : 'border-green-400'} rounded-md`}>
            <p className="col-span-2" data-cy='transactionTitle'>{tr.title}</p>
            <p className="col-span-2" data-cy='transactionAmount'>{formattedAmount}</p>
            <p className="col-span-2">{formattedDate}</p>
            <form action={removeTransaction}>
              <input type="hidden" name="transactionId" value={tr._id} />
              <SubmitButton size='icon' variant="ghost" className="justify-self-end" cy='deleteTransaction'>
                <Trash2 className="w-5 h-5 text-destructive" />
              </SubmitButton>
            </form>
          </div>
          )
        })}
      </section>
    </div>
  )
}
