import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next');
    const supabase = await createClient();

    if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    if (next) {
        return NextResponse.redirect(`${origin}${next ?? '/'}`);
    }

    const { data: {user} } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.username) {
        return NextResponse.redirect(`${origin}${'/login/setup-profile'}`);
    } else {
        return NextResponse.redirect(`${origin}${'/messages'}`);
    }    
}