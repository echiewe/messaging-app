'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
    const supabase = createClient()
    const router = useRouter()

    async function handleSignOut(): Promise<void> {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return <button className='h-max w-max' 
    onClick={handleSignOut}><img src='/icons/logout.png' width={35}/></button>
}