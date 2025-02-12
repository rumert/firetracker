import { cookies } from 'next/headers';
import AccountDeletion from './AccountDeletion'
import Nickname from './Nickname'
import Password from './Password'
import { getNickname } from '@/services/userService';
import Avatar from '../../components/Avatar';
import Image from 'next/image';
import Link from 'next/link';

export default async function page() {
  const token = cookies().get("access_token")?.value;
  const nickname = await getNickname(token)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      
      <div className='flex justify-between'>
        <div className='flex gap-4'>
          <Link href='/' className='relative h-10 w-10'>
            <Image
            src='/logo.png'
            width='100'
            height='100'
            alt='icon'
            />
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
        <Avatar />
      </div>
      <div className="space-y-8">
        <Nickname currentNickname={nickname} />
        <Password />
        <AccountDeletion />
      </div>
    </div>
  )
}
