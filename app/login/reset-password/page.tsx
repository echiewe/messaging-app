"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
    const supabase = await createClient();

    // check there's an active session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // check the session came from a recovery flow specifically
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.recovery_sent_at === null || !session) redirect('/login');

    // extra check — make sure recovery was recent (within 1 hour)
    const recoveryAge = Date.now() - new Date(session.user.recovery_sent_at!).getTime();
    const oneHour = 60 * 60 * 1000;
    if (recoveryAge > oneHour) redirect('/login');

    return <ResetPasswordClient />
}