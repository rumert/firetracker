type createTransactionVariables = {
  budget_id: string;
  type: string;
  amount: number;
  date: string,
  title: string,
};

type CreateTransactionRes = {
  createTransaction: {
    _id: string;
  };
};

export async function createTransaction( 
  date: string, 
  budgetId: string, 
  currentState: { message: string }, 
  formData: FormData 
) {
  const title = formData.get('title') as string;
  const amount = formData.get('amount') as string
  const type = formData.get('type') as string;

  try {
      console.log(typeof(parseInt(amount, 10)))
      const variables: createTransactionVariables = {
        budget_id: budgetId,
        type,
        amount: type === 'income' ? parseInt(amount, 10) : -parseInt(amount, 10),
        date,
        title
      };
      const mutation = `
        mutation CreateTransaction($budget_id: String!, $type: String!, $amount: Int!, $date: Date!, $title: String!) {
          createTransaction(transaction: { budget_id: $budget_id, type: $type, amount: $amount, date: $date, title: $title } ) {
            _id
          }
        }
      `;
      
      const data: CreateTransactionRes = await fetchGraphQL(mutation, variables)
      return {
        message: 'success'
      }

  } catch (error) {
    console.log(error)
    return {
      message: 'failed'
    }
  }
}

