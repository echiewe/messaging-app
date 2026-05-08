"use server";
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function markConversationRead(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { error } = await supabaseAdmin
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
    ;

    if (error) {
        console.log(error.message);
    }
}