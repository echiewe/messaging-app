'use client';
import Link from "next/link";
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { Conversation } from "@/lib/types";

import { PixelBorder } from "../../components/PixelBorder";
import LoadingPage from "../../components/Loading";
import ErrorPage from "../../components/Error";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ConversationPreview from "./components/ConversationPreview";
import AddChatButton from "../components/AddChatButton";
import Background from "../components/Background";


export default function Messages() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        async function fetchConversations() {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
            .from('conversations')
            .select(`
                id,
                created_at,
                name,
                conversation_members!inner (
                    user_id
                ),
                messages (
                    conversation_id,
                    content,
                    created_at
                )
            `)
            .eq('conversation_members.user_id', user!.id)
            .order('created_at', { referencedTable: 'messages', ascending: false })
            .limit(1, { referencedTable: 'messages' })

            if (error) {
                console.error("Error fetching conversations:", error);
                setError("Error loading data. Please try again.");
            }

            const conversations = data?.map((row) => ({
                id: row.id,
                created_at: row.created_at,
                name: row.name,
                lastMessage: row.messages[0]?.content ?? "Start chatting!"
            }));

            if (!error) setConversations(conversations as Conversation[]);
            setLoading(false);
        }

        fetchConversations();
    }, []);

    const renderConversations = () => {
        if (loading) return <LoadingPage />;
        if (error) return <ErrorPage message={error}/>;
        return (
            <div className="flex flex-col w-full overflow-auto">
                {conversations?.map((c) => (
                    <Link key={c.id} href={`/messages/${c.id}`}>
                        <ConversationPreview 
                        conversationTitle={c.name} 
                        lastMessage={c.lastMessage} 
                        status="unread"/>
                    </Link>
                ))}
            </div>
        );
    };   
    
    return (
        <Background headerTitle="Messages" >
            { renderConversations() }
            <AddChatButton />
        </Background>
    );
}