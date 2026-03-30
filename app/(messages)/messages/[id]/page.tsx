'use client';
import { use, useEffect, useState, useRef } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/lib/types";
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import Background from '../../components/Background';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>
}

export default function ConversationPage({ params }: Props) {
    const router = useRouter();
    const id = use(params).id;
    const supabase = createClient();

    const [messages, setMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<string>('');
    const [message, setMessage] = useState<string>('')
    const [chatName, setChatName] = useState<string>('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // TODO: pagination 

    useEffect(() => {
        async function fetchMessages() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user!.id);

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', id)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
            if (error) {
                console.error("Error fetching conversations:", error);
                setError("Error loading data. Please try again.");
            }
        }

        async function fetchConversationInfo() {
            const { data: conversation } = await supabase
                .from('conversations')
                .select('name')
                .eq('id', id)
                .single();
            setChatName(conversation?.name);
        }

        fetchMessages();
        fetchConversationInfo();
        setLoading(false);
    }, [id]);

    const isInitialLoad = useRef(true);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: isInitialLoad.current ? "instant" : "smooth"
        });
        isInitialLoad.current = false;
    }, [messages]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
        .channel(`conversation:${id}`)
        .on(
            'postgres_changes',
            {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${id}`,
            },
            (payload) => {
                setMessages((prev) => [...prev, payload.new as Message])
            }
        )
        .subscribe();

        return () => {
        supabase.removeChannel(channel)
        };
    }, [id]);

    const handleSend = () => {
        if (!message.trim()) return;
        insertIntoDB();
        setMessage('');
    };

    async function insertIntoDB() {
        const { error } = await supabase
            .from('messages')
            .insert({conversation_id: id, sender_id: user, content: message});
        if (error) {
            console.error("Error sending message:", error);
            setError("Error sending message. Please try again later.");
        }
    }

    return (
        <div className="h-screen w-screen bg-white md:bg-[#ecf0e9] flex justify-center items-center">
            <div className='h-full w-full md:h-4/5 md:w-1/4  md:bg-white border-dark-green border-4 flex flex-col justify-end items-center'>
                <div className="w-full flex justify-center">
                    <Header iconUrl='/icons/back.png' title={chatName} onIconClick={() => router.push('/messages')} width={20} />
                </div>
                <div className="flex-1 min-h-0 w-full p-3 flex flex-col">
                    <div className='flex flex-col flex-1 w-full overflow-auto py-2'>
                        {messages.map((m) => (
                            <div className={`w-full flex ${m.sender_id == user ? 'justify-end': 'justify-start'}`} key={m.id}>
                                <div className={`flex flex-col ${m.sender_id == user ? 'items-end' : 'items-start'}`}>
                                    <p className={`max-w-xs p-2 m-2 ${m.sender_id == user ? 'bg-light-green' : 'bg-gray-200'}`}>
                                        {m.content}
                                    </p>
                                    <p className='text-gray-300 text-xs mx-2'>{new Date(m.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <div className='flex w-full'>
                        <input 
                        className='flex-1 border border-dark-green focus:outline-none focus:ring-1 focus:ring-blue p-2' 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder='Message...'/>
                        <button className='bg-dark-green text-white p-2' onClick={handleSend}>Send</button>
                    </div>
                </div>
                {/* <PixelBorder children={<p className="text-xl">MESSAGE</p>}/> */}
            </div>
        </div>
    );

}   