'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from "@/lib/supabase/client";
import { createConversation } from '@/app/services/createConversation';

import Background from "../../components/Background";
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default function NewConversation() {
    const supabase = createClient();
    const router = useRouter();

    const [currUserId, setCurrUserId] = useState<string | null>(null);
    const [prefix, setPrefix] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [chatName, setChatName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: {user}}) => {
            setCurrUserId(user!.id ?? null);
        })
    }, []);

    useEffect(() => {
        async function fetchUsers(prefix: string) {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, display_name')
                .or(`username.ilike.${prefix}%, display_name.ilike.${prefix}%`)
                .neq('id', currUserId);
            
            const users = profiles as User[];

            if (error) {
                console.error("Error retrieving users:", error);
                setError("Error retrieving users. Please try again.");
            }
            
            return users;
        }

        const timeout = setTimeout(async () => {
            if (!prefix.trim()) {
                setResults([]);
                setIsOpen(false);
                return
            }
            setLoading(true);
            const users = await fetchUsers(prefix);
            const filtered = (users ?? []).filter(
                (u) => !selectedUsers.some((s) => s.id === u.id)
            );
            setResults(filtered);
            setIsOpen(filtered.length > 0);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [prefix, selectedUsers]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])

    function handleSelect(user: User) {
        setSelectedUsers((prev) => [...prev, user]);
        setPrefix("");
        setIsOpen(false);
    }

    function handleRemove(userId: string) {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
    }

    const handleSubmit = async () => {
        await insertIntoDB();
    }

    async function insertIntoDB() {
        const convName =
            chatName === ''
                ? selectedUsers.map(user => user.username).join(", ")
                : chatName;
       
        const { error } = await createConversation(
            selectedUsers.map((u) => u.id), // only pass IDs, not full user objects
            convName
        )

        if (error) {
            console.log(error);
            setError(error);
            return;
        }

        router.push('/messages');
    }

    if (error) {
        return <Background headerTitle='New Chat' className='flex flex-col justify-center items-center'>
            <p className='text-red-500'>{error}</p>
            <p className='text-red-500'>Please try again later.</p>
        </Background>;
    }

    return (
        <Background headerTitle='New Chat' className='px-3 py-4'>
            <form onSubmit={(e) => {e.preventDefault(); handleSubmit()}} className="flex flex-col h-full justify-between py-5">
                <div className="">
                    <div className="flex flex-col gap-3">
                        <input 
                            className='input' 
                            id='chatName' 
                            type='text' 
                            value={chatName} 
                            onChange={(e) => setChatName(e.target.value)} 
                            placeholder="Chat name (optional)" />

                        <input 
                            className='input' 
                            id='members'
                            type='text' 
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value)}
                            placeholder='Search for members...' />

                        {/* selectable users */}
                        {isOpen && (
                            <div className="absolute z-10 w-max mt-1 bg-white border border-gray-200 shadow-md">
                                {loading ? (
                                    <div className="px-3 py-2 text-sm text-gray-400">Searching...</div>
                                ) : (
                                    results.map((user) => (
                                        <button
                                        key={user.id}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex flex-col"
                                        onMouseDown={(e) => e.preventDefault()} // prevent input blur before click fires
                                        onClick={() => handleSelect(user)}
                                        >
                                        <span className="font-medium">{user.display_name}</span>
                                        <span className="text-gray-400 text-xs">@{user.username}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* selected users */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((user) => (
                                <div
                                key={user.id}
                                className="flex items-center gap-1 bg-[#ecf0e9]  px-3 py-1 text-sm"
                                >
                                    <span>{user.display_name}</span>
                                    <button
                                        onClick={() => handleRemove(user.id)}
                                        className="text-gray-400 hover:text-gray-700 ml-1 leading-none"
                                        aria-label={`Remove ${user.display_name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            </div>
                        )}

                    </div>
                </div>
                <button className='w-full bg-dark-green p-3 text-background' type='submit'>Create chat</button>
            </form>
        </Background>
    );
}