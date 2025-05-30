import { createClient } from '@supabase/supabase-js'

// Obtenha as variáveis de ambiente 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Em ambiente de produção, devemos garantir que as variáveis existam
// Em desenvolvimento, permitiremos valores padrão para facilitar a inicialização
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Faltam as variáveis de ambiente do Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
