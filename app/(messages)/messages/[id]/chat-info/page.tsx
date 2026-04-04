'use client';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Background from "@/app/(messages)/components/Background";
import ErrorPage from "@/app/components/Error";
import LoadingPage from "@/app/components/Loading";
import { User } from "@/lib/types";

export default function ChatInfo() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [chatName, setChatName] = useState<string | null>(null);
    const [members, setMembers] = useState<User[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const id = pathname.split('/')[2];
        const fetchInfo = async () => {
            setFetching(true);
            const { data: { user } } = await supabase.auth.getUser();

            const { data: chatData, error: chatError } = await supabase
            .from('conversations')
            .select('name')
            .eq('id', id)
            .single();

            if (chatError) return setError(chatError.message);

            if (chatData) {
                setChatName(chatData?.name);
            }

            const { data: memberData, error: memberError } = await supabase
            .from('conversation_members')
            .select(`
                profiles (
                    id,
                    username,
                    display_name,
                    avatar_url
                )
            `)
            .eq('conversation_id', id);

            if (memberError) return setError(memberError.message);

            const members = memberData?.map((row) => row.profiles as unknown as User) ?? []

            setMembers(members);
            setFetching(false);
        }
        
        fetchInfo();
    }, [])

    const goBack = () => {
        const parent = pathname.split('/').slice(0, -1).join('/');
        router.push(parent);
    }

    if (fetching) {
        return <Background headerTitle="Chat Information" headerIconUrl="/icons/back.png" headerIconFunc={goBack} headerIconWidth={20}>
            <LoadingPage />
        </Background>
    }

    if (error) {
        return (
        <Background headerTitle="Chat Information" headerIconUrl="/icons/back.png" headerIconFunc={goBack} headerIconWidth={20}>
            <ErrorPage message={error}/>
        </Background>)
    }

    return (
        <Background 
        headerTitle="Chat Information" 
        headerIconUrl="/icons/back.png" 
        headerIconFunc={goBack}
        headerIconWidth={20}
        className="px-3 py-4 h-full flex flex-col justify-between">

            <div className="flex flex-col justify-center my-3 w-full gap-3">
                <p className="inactive-input text-2xl">{chatName}</p>
                <p className="ml-3">{members.length} members</p>         
            </div>
            
            {/* Member list */}
            <div className="flex-1 flex flex-col gap-3 overflow-auto">
                <h2>Members</h2>
                <div className="flex flex-col gap-2">
                    {members?.map((m) => (
                        <div key={m.id} className="flex justify-start items-center gap-5 border border-dark-green bg-light-green/50 px-3 py-1.5">
                            <img src={m.avatar_url || '/icons/default-avatar.jpg'} className="border border-dark-green bg-white h-10 w-auto p-1"/>
                            <div className="flex flex-col gap-0.5">
                                <p>{m.display_name || m.username}</p>
                                <p className="text-gray-500">@{m.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </Background>
    );
}