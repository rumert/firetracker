import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import AddTransaction from "./AddTransaction";
import { Trash2 } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import { redirect } from "next/navigation";



export default async function Transactions({ budgetId, transactions }: any) {

  async function deleteTransaction(FormData: any) {
    "use server"
    const transactionId = FormData.get("transactionId")
    const amount = FormData.get("amount")
    const type = FormData.get("type")
    let redirectPath = undefined;
    try {
      await fetchWithTokens(`${process.env.NODE_API_URL}/deleteTransaction`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ budgetId, transactionId, amount, type })
      });

      redirectPath = `/${budgetId}`

    } catch (error) {
      console.log(error)
    } 
    if (redirectPath) {
      redirect(redirectPath)
    }
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
        {transactions.map((tr: any, index: any) => {
          const date = new Date(tr.date);
          const month = date.toLocaleString('default', { month: 'short' })
          const day = date.getDate()
          //const year = date.getFullYear()
          return (
          <div key={index} className={`h-16 pl-8 pr-2 mb-1 grid grid-cols-7 place-items-center border ${tr.type === 'expense' ? 'border-destructive' : 'border-green-400'} rounded-md`}>
            <p className="col-span-2">{tr.title}</p>
            <p className="col-span-2">${tr.amount}</p>
            <p className="col-span-2">{month}/{day}</p>
            <form action={deleteTransaction}>
              <input type="hidden" name="transactionId" value={tr._id} />
              <input type="hidden" name="amount" value={tr.amount} />
              <input type="hidden" name="type" value={tr.type} />
              <SubmitButton size='icon' variant="ghost" className="justify-self-end">
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
