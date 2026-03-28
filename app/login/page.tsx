'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LoginBackground from './components/LoginBackground';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<String | null>(null);

    async function handleEmailAuth() {
        setError(null);
        setLoading('loading');
        if (isSignUp) {
            // check username availability first
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single()

            if (existing) {
                setLoading(null)
                return setError("Username is already taken.")
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });

            if (signUpError) return setError(signUpError.message);

            // if identities is empty, the email is already registered
            if (data.user && data.user.identities?.length === 0) {
                setLoading(null);
                return setError("An account with this email already exists. Please sign in instead.");
            }

        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return setError(error.message);
        }

        router.push('/messages');
        router.refresh();
        setLoading(null);
    };


    const resetPassword = async () => {
        if (!email.trim()) {
            setError("Please enter your email address first.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/login/reset-password`, // where supabase sends the user
        })

        if (error) {
            setError(error.message);
            return;
        }
        
        window.alert("Check your email for a password reset link.");
    };

    return (
        <LoginBackground>
            <h1 className='text-2xl mb-3 font-semibold'>{isSignUp ? 'Create Account' : 'Sign In'}</h1>

            <div className='flex flex-col gap-3'>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className='login-input'
                />
                {isSignUp && 
                <input
                    type="text"
                    placeholder='Username'
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    className='login-input'
                />
                }
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className='login-input'
                />
            </div>

            {error && <p className='text-red-500'>{error}</p>}

            <button onClick={handleEmailAuth} className='block w-[150px] button'>
                {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>


            <p>
                {isSignUp ? 'Already have an account? ': "Don't have an account? "} 
                <button onClick={() => setIsSignUp(!isSignUp)} className='hover:text-blue hover:underline'>
                    {isSignUp ? 'Sign in.' : "Sign up."}
                </button>
            </p>

            {isSignUp == false && <p>
                Forgot your password? <button onClick={resetPassword} className='hover:text-blue hover:underline'>Click here.</button>
            </p>
            }
        </LoginBackground>
    );
}