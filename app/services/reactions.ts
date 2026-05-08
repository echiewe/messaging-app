"use server";
import { createClient } from '@/lib/supabase/server';

export async function addReaction(messageId: string, reaction: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    // if reaction already exists, remove it (toggle behaviour)
    const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction', reaction)
        .single()

    if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id)
        return { removed: true }
    }

    const { error } = await supabase
        .from('message_reactions')
        .insert({ message_id: messageId, user_id: user.id, reaction })

    if (error) return { error: error.message }
    return { success: true }
}