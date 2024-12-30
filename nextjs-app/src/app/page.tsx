import AddBudget from "@/components/AddBudget";
import { fetchGraphQL } from "@/lib/utils/graphql";
import { redirect } from "next/navigation";

type QueryRes = {
  defaultBudget: {
    _id: string
  } 
}

export default async function Home() {

  const query = `
    query DefaultBudget {
      defaultBudget {
        _id
      }
    }
  `;

  const data: QueryRes = await fetchGraphQL(query);

  return data.defaultBudget ? 
  (
    redirect(`/${data.defaultBudget._id}`)
  )
  :
  (
    <main>
      <AddBudget isFirst={true} />
    </main>
  );
}