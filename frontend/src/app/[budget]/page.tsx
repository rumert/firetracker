import fetchWithTokens from '@/lib/utils/fetchWithTokens';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function page({ params }: any) {
    let budget = null
    try {
        const response = await fetchWithTokens(`${process.env.NODE_API_URL}/getBudget`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ budgetId: params.budget })
        });
        const data = await response.json();
        budget = data.bucket
    } catch (error) {
        console.log(error)
    }

  return !budget ? redirect('/') :
    (
    <main>

    </main>  
    ) 
}
