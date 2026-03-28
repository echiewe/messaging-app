"use client";
import Background from "./(messages)/components/Background";
import { useRouter } from "next/navigation";


export default function Home() {
    const router = useRouter();
    return (
        <Background className="flex flex-col justify-center items-center gap-5">
            <h1 className="text-2xl">Landing page</h1>
            <button className='button' onClick={() => router.push('/login')}>Get started!</button>
        </Background>
    );
}
