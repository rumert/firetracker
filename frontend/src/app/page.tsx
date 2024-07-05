import AddBudget from "@/components/AddBudget";
import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import { redirect } from "next/navigation";

async function getDefaultBucketId(): Promise<string | null> {
  try {
    const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getDefaultBudgetId`);
    const data = await response.json();
    return data.budgetId._id
  } catch (error) {
    console.log(error)
    return null
  }
}

export default async function Home() {

  const budgetId = await getDefaultBucketId()

  return budgetId ? 
  (
    redirect(`/${budgetId}`)
  )
  :
  (
    <main>
      <AddBudget isFirst={true} />
    </main>
  );
}
