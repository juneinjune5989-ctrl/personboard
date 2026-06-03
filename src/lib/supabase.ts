import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aniiytghrdtexzmintqa.supabase.co'
const supabaseAnonKey = 'sb_publishable_vr_mfxMJ1kRtF6n3RaKkEw_iwi5DfhH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)