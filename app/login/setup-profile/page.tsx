"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LoginBackground from "../components/LoginBackground";

export default function SetupProfile() {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [userId, setUserId] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [notUnique, setNotUnique] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const { data: { user }, error } = await supabase.auth.getUser();
            setUserId(user!.id)

            if (error) return setError(error.message);
        }
        getUser();
    }, [])
    
    useEffect(() => {
        async function checkUsernames() {
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                // .neq('id', userId) // exclude current user
                .single()

            return existing;
        }
        const timeout = setTimeout(async () => {
            if (!username.trim()) {
                return
            }
            const exists = await checkUsernames();
            if (exists) {
                setNotUnique(true);
            } else {
                setNotUnique(false);
            }
        }, 300);
        return () => clearTimeout(timeout); 
    }, [username])

    const handleSubmit = async () => {
        if (displayName === '') setDisplayName(username);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                display_name: displayName,
                username: username,
            })
            .eq('id', userId)
        
        if (updateError) return setError(updateError.message);
        router.push('/messages');
    }

    return (
        <LoginBackground>
            <div className="w-2/3 flex flex-col gap-4 text-center">
                <h1 className="text-2xl mb-3">Finish setting up your profile:</h1>
                <input 
                    className='login-input' 
                    type="text" 
                    placeholder="Username (required)" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}/>
                {notUnique && (<p className="text-gray-400">Username is already taken</p>)}
                <input 
                    className='login-input' 
                    type='text' 
                    placeholder="Display Name (optional)" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}/>
                <button className="button" disabled={notUnique || username === ''} onClick={handleSubmit}>Continue</button>
            </div>
        </LoginBackground>
    );
}