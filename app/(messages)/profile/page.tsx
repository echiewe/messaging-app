'use client';
import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

import Background from "../components/Background";
import SignOutButton from "../components/SignOutButton";
import LoadingPage from "@/app/components/Loading";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [draftDisplayName, setDraftDisplayName] = useState('')
    const [draftUsername, setDraftUsername] = useState('')
    const [username, setUsername] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('username, display_name, avatar_url')
                .eq('id', user!.id)
                .single();
            
            if (error) {
                console.error("Error fetching profile:", error);
                setError("Error loading profile. Please try again later.");
            }

            setUsername(profile!.username);
            setDisplayName(profile!.display_name)
            setEmail(user!.email as string);
        }
        fetchProfile();
    })

    function handleEdit() {
        // sync drafts to current saved values before opening edit mode
        setDraftDisplayName(displayName!);
        setDraftUsername(username!);
        setIsEditing(true);
    }

    function handleCancel() {
        setError(null);
        setIsEditing(false);
    }

    // Username, display name, avatar
    async function handleSave() {
        setError(null)
        setLoading(true)

        // check username isn't taken by someone else
        const { data: { user } } = await supabase.auth.getUser()

        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', draftUsername)
            .neq('id', user!.id) // exclude current user
            .single()

        if (existing) {
            setError("Username is already taken.")
            setLoading(false)
            return
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                display_name: draftDisplayName,
                username: draftUsername,
            })
            .eq('id', user!.id)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        // commit drafts to display values only on success
        setDisplayName(draftDisplayName)
        setUsername(draftUsername)
        setIsEditing(false)
        setLoading(false)
    }

    if (loading) {
        return <Background headerTitle="Profile">
            <LoadingPage/>
        </Background>
    }

    return(
        <Background headerTitle='Profile' className="px-3 py-4 flex flex-col gap-4 items-center">
            <div className="flex flex-col justify-start gap-5 items-center">
                <img
                src='/icons/jas.png'
                alt="profile image"
                width={100}
                className="border border-dark-green p-2"
                />
                <div className="flex gap-3">
                    {isEditing ? (
                    <input
                        className="input"
                        value={draftDisplayName}
                        onChange={(e) => setDraftDisplayName(e.target.value)}
                        placeholder="Display name"
                    />
                    ) : (
                    <p className="text-2xl">{displayName}</p>
                    )}
                    <SignOutButton />
                </div>
                
            </div>

            {/* Username */}
            <div className="flex items-center gap-2">
                <p className="text-xl">Username:</p>
                {isEditing ? (
                <input
                    className="input"
                    value={draftUsername}
                    onChange={(e) => setDraftUsername(e.target.value)}
                    placeholder="Username"
                />
                ) : (
                <p className="text-xl">{username}</p>
                )}
            </div>

            <p className="text-xl">Email: {email}</p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Action buttons */}
            {isEditing ? (
                <div className="flex gap-2">
                    <button className="button" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="button" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            ) : (
                <button className="button" onClick={handleEdit}>
                Edit profile
                </button>
            )}
            
        </Background>
    );
}