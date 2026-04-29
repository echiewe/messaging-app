'use client';
import { useState, useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

import Background from "../components/Background";
import SignOutButton from "../components/SignOutButton";
import LoadingPage from "@/app/components/Loading";
import Alert from "@/app/components/Alert";
import { uploadProfileImage, removeProfileImage } from "./uploadProfileImage";

export const dynamic = 'force-dynamic';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [updateProfileImage, setUpdateProfileImage] = useState(false)
    const [draftDisplayName, setDraftDisplayName] = useState('')
    const [draftUsername, setDraftUsername] = useState('')
    const [username, setUsername] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [isAlert, setIsAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertStatus, setAlertStatus] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            setFetching(true);
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
            setAvatarUrl(profile!.avatar_url);
            setEmail(user!.email as string);
            setFetching(false);
        }
        fetchProfile();
    }, [])

    useEffect(() => {
        if (!isAlert) return;

        const timer = setTimeout(() => {
            setIsAlert(false);
        }, 3000); 

        return () => clearTimeout(timer);
    }, [isAlert]);

    const handleEdit = () => {
        setDraftDisplayName(displayName!);
        setDraftUsername(username!);
        setIsEditing(true);
    }

    const handleCancel = () => {
        setError(null);
        setIsEditing(false);
        setImagePreview(avatarUrl);
        setUpdateProfileImage(false);
    }

    const handleUploadImage = () => {
        fileInputRef.current?.click();
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        setUpdateProfileImage(false);
    }

    const handleRemoveImage = async () => {
        setUpdateProfileImage(false);
        setImagePreview('/icons/default-avatar.jpg');
    }

    // Username, display name, avatar
    const handleSave = async () => {
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

        // upload image if one was selected
        if (fileInputRef.current?.files?.[0]) {
            const formData = new FormData();
            formData.append('image', fileInputRef.current.files[0]);
            const { error: imageError, url } = await uploadProfileImage(formData);

            if (imageError) {
                setError(imageError);
                setLoading(false);
                return;
            }

            // clear the local preview now that it's uploaded
            setImagePreview(null);
            setAvatarUrl(url as string);
        } else if (imagePreview === '/icons/default-avatar.jpg') {
            const { error } = await removeProfileImage()

            if (error) {
                setError(error)
                setLoading(false)
                return
            }

            setImagePreview(null);
            setAvatarUrl(null);
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                display_name: draftDisplayName,
                username: draftUsername,
            })
            .eq('id', user!.id)

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        // commit drafts to display values only on success
        setDisplayName(draftDisplayName);
        setUsername(draftUsername);
        setIsEditing(false);
        setLoading(false);

        setIsAlert(true);
        setAlertMessage('Profile successfully updated.')
        setAlertStatus('success');
    }

    if (fetching) {
        return <Background headerTitle="Profile">
            <LoadingPage/>
        </Background>
    }


    return(
        <Background headerTitle='Profile' className="px-3 py-4 flex flex-col gap-4 items-center">
            {isAlert && <Alert message={alertMessage} status={alertStatus}/>}

            <div className="relative flex flex-col justify-start gap-5 items-center">
                <img
                src={imagePreview ?? avatarUrl ?? '/icons/default-avatar.jpg'}
                alt="profile image"
                width={180}
                height={180}
                className="border border-dark-green p-2"
                />

                {/* hidden file input */}
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageSelect}
                />
                {isEditing && (
                    <button 
                    onClick={() => {updateProfileImage ? setUpdateProfileImage(false) : setUpdateProfileImage(true)}} 
                    className="absolute bottom-[-10] right-[-10] p-0 button z-100">
                        {updateProfileImage ? '✕' : '🖋'}
                    </button>
                )}

                {isEditing && updateProfileImage && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-500/50 flex flex-col justify-center items-center gap-3">
                        <button onClick={handleUploadImage} className="button">Upload new</button>
                        <button onClick={handleRemoveImage} className="scary-button">Remove</button>
                    </div>
                )}
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-3 w-full">
                <p className="text-lg">Display Name: </p>
                {isEditing ? (
                    <input
                        className="input"
                        value={draftDisplayName}
                        onChange={(e) => setDraftDisplayName(e.target.value)}
                        placeholder="Display name"
                    />    
                ) : (
                    <p className="inactive-input">{displayName}</p>
                )}
                         
            </div>

            {/* Username */}
            <div className="flex flex-col gap-3 w-full">
                <p className="text-lg">Username:</p>
                {isEditing ? (
                    <input
                        className="input"
                        value={draftUsername}
                        onChange={(e) => setDraftUsername(e.target.value)}
                        placeholder="Username"
                    />
                ) : (
                    <p className="inactive-input">{username}</p>
                )}
            </div>

            <div className="flex flex-col gap-3 w-full">
                <p className="text-lg">Email:</p>
                <p className="inactive-input">{email}</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Action buttons */}
            {isEditing ? (
                <div className="flex flex-col gap-2 w-full">
                    <button className="button w-full" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="button w-full" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            ) : (
                <button className="button w-full" onClick={handleEdit}>
                Edit profile
                </button>
            )}
            {!isEditing && <SignOutButton />}
        </Background>
    );
}