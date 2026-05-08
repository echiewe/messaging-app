"use server"
import { createClient } from '@/lib/supabase/server'
import { profileImageStorage } from '@/lib/storage'
import { compressImage, compressionPresets } from '@/lib/storage/compress'

export async function uploadProfileImage(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    const file = formData.get('image') as File
    if (!file) return { error: "No file provided" }

    // convert File to Buffer for sharp
    const arrayBuffer = await file.arrayBuffer()
    const rawBuffer = Buffer.from(arrayBuffer)

    // compress before uploading
    const { buffer, mimeType } = await compressImage(rawBuffer, compressionPresets.profileImage)

    const path = `${user.id}/avatar.webp` // always overwrite the same path
    const url = await profileImageStorage.upload(path, buffer, mimeType)

    // save url to profile
    await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

    return { url }
}

export async function removeProfileImage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    // delete from storage
    await profileImageStorage.delete(`${user.id}/avatar.webp`)

    // clear url in profile
    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}