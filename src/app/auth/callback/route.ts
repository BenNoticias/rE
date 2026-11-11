import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cleanSupabaseUrl } from '@/lib/supabase';

/**
 * Route Handler para Callback de Autenticação OAuth (Google) via Supabase Auth
 * Configurado para Vercel e ambiente local.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (rawUrl && supabaseAnonKey) {
      const supabaseUrl = cleanSupabaseUrl(rawUrl);
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.exchangeCodeForSession(code);
      } catch (err) {
        console.error('[Auth Callback] Erro ao trocar código de autorização por sessão:', err);
      }
    }
  }

  // Redireciona o usuário para a página inicial com a sessão validada
  return NextResponse.redirect(`${origin}/`);
}
