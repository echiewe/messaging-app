"use server"
import { createClient } from '@/lib/supabase/server'
import { chatImageStorage } from '@/lib/storage'
import { compressImage, compressionPresets } from '@/lib/storage/compress'

export async function uploadChatImage(formData: FormData, conversationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    const file = formData.get('image') as File
    if (!file) return { error: "No file provided" }

    const arrayBuffer = await file.arrayBuffer()
    const rawBuffer = Buffer.from(arrayBuffer)

    const { buffer, mimeType } = await compressImage(rawBuffer, compressionPresets.chatImage)

    const path = `${conversationId}/${user.id}/${Date.now()}.webp`
    const url = await chatImageStorage.upload(path, buffer, mimeType)

    await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: url,
        type: 'image'
    })

    return { url }
}