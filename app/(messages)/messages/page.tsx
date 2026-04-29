'use client';
import Link from "next/link";
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { Conversation } from "@/lib/types";

import LoadingPage from "../../components/Loading";
import ErrorPage from "../../components/Error";
import ConversationPreview from "./components/ConversationPreview";
import AddChatButton from "../components/AddChatButton";
import Background from "../components/Background";

export const dynamic = 'force-dynamic';

export default function Messages() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        async function fetchConversations() {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
            .from('conversations_with_last_message')
            .select(`
                id,
                created_at,
                name,
                last_message_at,
                conversation_members!inner (
                    user_id,
                    last_read_at
                ),
                messages (
                    conversation_id,
                    content,
                    created_at,
                    type
                )
            `)
            .eq('conversation_members.user_id', user!.id)
            .order('created_at', { referencedTable: 'messages', ascending: false })
            .order('last_message_at', { ascending: false })
            .limit(1, { referencedTable: 'messages' })

            if (error) {
                console.error("Error fetching conversations:", error);
                setError("Error loading data. Please try again.");
            }

            const conversations = data?.map((row) => {
                const lastMessage = row.messages[0]?.content ? (row.messages[0].type === 'image' ? '[Image]' : row.messages[0].content) : "Start chatting!"
                const lastReadAt = row.conversation_members?.[0]?.last_read_at
                const lastSent = row.messages[0]?.created_at || row.created_at
                const isUnread = lastMessage && lastReadAt
                    ? new Date(lastSent) > new Date(lastReadAt) 
                    && lastMessage.sender_id !== user 
                    : false

                return {
                    id: row.id,
                    created_at: row.created_at,
                    name: row.name,
                    lastMessage: lastMessage,
                    lastSent: lastSent,
                    isUnread: isUnread
                }
            });

            if (!error) setConversations(conversations as Conversation[]);
            setLoading(false);
        }

        fetchConversations();
    }, []);

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
        return <Background headerTitle="Messages">
            <LoadingPage/>
        </Background>
    }

    if (error) {
        return <Background headerTitle="Messages">
            <ErrorPage message={error}/>
        </Background>
    }
    
    return (
        <Background headerTitle="Messages" className="relative">
            <div className="flex flex-col w-full overflow-auto">
                {conversations?.map((c) => (
                    <Link key={c.id} href={`/messages/${c.id}`}>
                        <ConversationPreview 
                        conversationTitle={c.name} 
                        lastMessage={c.lastMessage.length > 30 ? c.lastMessage.slice(0,30) + '...' : c.lastMessage} 
                        lastSent={c.lastSent && parseDate(new Date(c.lastSent))}
                        status={c.isUnread ? 'unread' : 'read'}/>
                    </Link>
                ))}
            </div>
            <AddChatButton />
        </Background>
    );
}