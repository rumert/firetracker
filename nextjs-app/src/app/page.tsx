import CreateBudget from "@/components/AddBudget";
import { getDefaultBudget } from "@/services/budgetService";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = cookies().get("access_token")?.value;

  const defaultBudget = await getDefaultBudget(token)

  return defaultBudget ? 
  (
    redirect(`/${defaultBudget._id}`)
  )
  :
  (
    <main>
      <CreateBudget isFirst={true} />
    </main>
  );
}