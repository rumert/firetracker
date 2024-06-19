import AddBudget from "@/components/AddBudget";
import fetchWithTokens from "@/lib/utils/fetchWithTokens";
import { redirect } from "next/navigation";

export default async function Home() {

  let budgetId = undefined;
  try {
    const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getDefaultBudget`);
    const data = await response.json();
    budgetId = data.budget?._id
  } catch (error: any) {
    console.log(error)
  }

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
