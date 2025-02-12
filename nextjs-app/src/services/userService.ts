export async function getNickname(
    token?: string
): Promise<string> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/account/nickname`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
    const resData = await res.json()
    if (!res.ok) {
        throw Error(resData.error)
    }
    return resData.nickname
}

export async function updateNickname( 
  nickname: string
) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/main/account/nickname`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        body: JSON.stringify({ nickname }),
    });
    const resData = await res.json()
    if (!res.ok) {
        throw Error(resData.error)
    }
    return resData
}

export async function updatePassword( 
    currentPassword: string,
    newPassword: string
) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/main/account/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    const resData = await res.json()
    if (!res.ok) {
        throw Error(resData.error)
    }
    return resData
}

export async function deleteAccount( 
    password: string
) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/main/account`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        body: JSON.stringify({ password }),
    });
    if (!res.ok) {
        const resData = await res.json()
        throw Error(resData.error)
    }
    return 'OK'
}