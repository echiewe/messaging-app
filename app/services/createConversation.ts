"use server"
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createConversation(selectedUserIds: string[], convName: string) {
    const supabase = await createClient();

    // Get the current user server-side so the client can't spoof it
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthenticated" }

    const { data: conversation, error: errorConv } = await supabaseAdmin
        .from('conversations')
        .insert({ name: convName })
        .select('id')
        .single()

    if (errorConv || !conversation) {
        return { error: errorConv.message }
    }

    // Always include the creator, merge with selected users, deduplicate
    const allUserIds = [...new Set([user.id, ...selectedUserIds])]

    const members = allUserIds.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
    }))

    const { error: errorMem } = await supabaseAdmin
        .from('conversation_members')
        .insert(members)

    if (errorMem) {
        console.log(errorMem);
        await supabase.from('conversations').delete().eq('id', conversation.id)
        return { error: errorMem.message }
    }

    return { conversationId: conversation.id }
}