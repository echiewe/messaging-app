"use client";
import LoginBackground from "./login/components/LoginBackground";
import { useRouter } from "next/navigation";


export default function Home() {
    const router = useRouter();
    return (
        <LoginBackground>
            <h1 className="text-2xl">Landing page</h1>
            <button className='button' onClick={() => router.push('/login')}>Get started!</button>
        </LoginBackground>
    );
}
