'use client';
import { use, useEffect, useState, useRef } from 'react';
import { createClient } from "@/lib/supabase/client";
import { uploadChatImage } from '../../../services/uploadChatImage';
import { Message, Reaction } from "@/lib/types";
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import Background from '../../components/Background';
import LoadingPage from '@/app/components/Loading';
import { markConversationRead } from '../../../services/markConversationRead';
import { MessageBubble } from './components/MessageBubble';

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
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // TODO: pagination 

    useEffect(() => {
        async function fetchMessages() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user!.id);
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    sender_id,
                    content,
                    created_at,
                    type,
                    message_reactions (
                        id,
                        reaction,
                        user_id
                    )
                `)
                .eq('conversation_id', id)
                .order('created_at', { ascending: true })

            if (data) setMessages(data);
            if (error) {
                console.error("Error fetching conversations:", error);
                setError("Error loading data. Please try again.");
            }
            console.log(data)
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

    // Mark as read
    useEffect(() => {
        markConversationRead(id);
    }, [id])

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
                setMessages((prev) => [...prev, { 
                    ...payload.new as Message, 
                    message_reactions: [] 
                }])
                markConversationRead(id);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'message_reactions',
                filter: `conversation_id=eq.${id}`,
            },
            (payload) => {
                const newReaction = payload.new as Reaction & { message_id: string }
                setMessages((prev) =>
                prev.map((m) =>
                    m.id === newReaction.message_id
                    ? { ...m, message_reactions: [...(m.message_reactions ?? []), newReaction] }
                    : m
                )
                )
            }
            )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'message_reactions',
                filter: `conversation_id=eq.${id}`, // ← server-side filter now
            },
            (payload) => {
                const removed = payload.old as { id: string, message_id: string }
                setMessages((prev) =>
                prev.map((m) =>
                    m.id === removed.message_id
                    ? { ...m, message_reactions: m.message_reactions.filter((r) => r.id !== removed.id) }
                    : m
                )
                )
            }
        )
        .subscribe();


        return () => {
            supabase.removeChannel(channel)
        };
    }, [id]);

    const handleSend = () => {
        insertIntoDB();
        setMessage('');
    };

    const insertIntoDB = async () => {
        if (image) {
            const formData = new FormData();
            formData.append('image', image);
            const { error } = await uploadChatImage(formData, id);
            if (error) {
                setError(error);
                return;
            }
            handleRemoveImage();
        }
        
        if (message.trim()) {
            const { error } = await supabase
                .from('messages')
                .insert({conversation_id: id, sender_id: user, content: message, type: 'text'});
            if (error) {
                console.error("Error sending message:", error);
                setError("Error sending message. Please try again later.");
            }
        }

        markConversationRead(id);
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImage(file);
        setImagePreview(URL.createObjectURL(file)); // create local preview URL
    }

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const parseDate = (date: Date) => {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    if (loading) {
        return <Background headerIconUrl='/icons/back.png' headerTitle={chatName} headerIconFunc={() => router.push('/messages')}>
            <LoadingPage />
        </Background>
    }

    return (
        <div className="h-screen w-screen bg-off-white md:bg-light-grey-green flex justify-center items-center">
            <div className='h-full w-full md:h-4/5 md:w-1/3 md:bg-off-white border-dark-green border-4 flex flex-col justify-end items-center'>
                <div className="w-full flex justify-center">
                    <Header 
                    iconUrl='/icons/back.png' 
                    title={chatName} 
                    onIconClick={() => router.push('/messages')} 
                    width={20} 
                    aboutIcon={true} 
                    aboutPage={() => router.push(`/messages/${id}/chat-info`)}/>
                </div>
                <div className="flex-1 min-h-0 w-full p-3 flex flex-col">
                    <div className='flex flex-col gap-1 flex-1 w-full overflow-auto py-2'>
                        {messages.map((m) => (
                            <MessageBubble 
                                key={m.id}
                                m={m}
                                conversationId={id}
                                currentUserId={user}
                                parseDate={parseDate}
                            />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    
                    <div className='flex flex-col w-full'>
                    {/* image preview */}
                        {imagePreview && (
                            <div className='relative w-max h-24 m-2'>
                            <img
                                src={imagePreview}
                                alt="preview"
                                className='w-auto h-full object-cover border border-dark-green p-1'
                            />
                            <button
                                onClick={handleRemoveImage}
                                className='absolute -top-2 -right-2 bg-orange text-white w-5 h-5 flex items-center justify-center text-xs leading-none'
                                aria-label="Remove image"
                            >
                                ×
                            </button>
                            </div>
                        )}

                        <div className='flex w-full'>
                            <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={handleImageSelect}
                            />
                            <button className='button text-xl' onClick={() => fileInputRef.current?.click()}>+</button>
                            <input 
                            className='flex-1 border border-dark-green focus:outline-none focus:ring-1 focus:ring-blue p-2' 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder='Message...'/>
                            <button className='bg-dark-green text-white p-2' onClick={handleSend}>Send</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

}   