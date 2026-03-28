import Background from "./(messages)/components/Background";
import { useRouter } from "next/navigation";


export default function Home() {
    const router = useRouter();
    return (
        <Background>
            <h1>Landing page</h1>
            <button onClick={() => router.push('/login')}>Get started!</button>
        </Background>
    );
}
