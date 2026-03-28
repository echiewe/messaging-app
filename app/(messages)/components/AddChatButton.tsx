'use client';
import { useRouter } from 'next/navigation';

// change '/messages' with '/new-conversation'

export default function AddChatButton() {
    const router = useRouter();

    return (
        <button
        onClick={() => router.push('/messages/new-conversation')}
        className="
            absolute bottom-5 right-5 z-50
            w-14 h-14
            bg-dark-green text-white
            text-3xl font-light
            shadow-lg hover:shadow-xl
            hover:scale-110
            transition-all duration-150
        "
        >
        +
        </button>
    )
}