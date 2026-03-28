'use client';
import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

import Background from "../components/Background";
import SignOutButton from "../components/SignOutButton";

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

    return(
        <Background headerTitle='Profile' className="px-3 py-4 flex flex-col gap-4">
            {/* <div className="flex justify-start gap-5">
                <img src='/icons/jas.png' alt="profile image" width={60} className="border border-dark-green p-2" />
                <p className="text-xl">{displayName}</p>
                <SignOutButton />
            </div>
            <div>Username: {username}</div>
            <div>Email: {email}</div>
            <button className="button">Update profile</button> */}
            <div className="flex justify-start gap-5 items-center">
                <img
                src='/icons/jas.png'
                alt="profile image"
                width={60}
                className="border border-dark-green p-2"
                />
                {isEditing ? (
                <input
                    className="input"
                    value={draftDisplayName}
                    onChange={(e) => setDraftDisplayName(e.target.value)}
                    placeholder="Display name"
                />
                ) : (
                <p className="text-xl">{displayName}</p>
                )}
                <SignOutButton />
            </div>

            {/* Username */}
            <div className="flex items-center gap-2">
                <span>Username:</span>
                {isEditing ? (
                <input
                    className="input"
                    value={draftUsername}
                    onChange={(e) => setDraftUsername(e.target.value)}
                    placeholder="Username"
                />
                ) : (
                <span>{username}</span>
                )}
            </div>

            {/* Email — never editable, just displayed */}
            <div>Email: {email}</div>

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
                Update profile
                </button>
            )}
            
        </Background>
    );
}