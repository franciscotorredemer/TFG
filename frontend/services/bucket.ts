import { createClient } from '@supabase/supabase-js'

const BUCKET_URL = 'https://lnfqesarnftkrcbcgtzl.supabase.co'
const BUCKET_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnFlc2FybmZ0a3JjYmNndHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Njc0NTEsImV4cCI6MjA1MzI0MzQ1MX0.t90ec-DDSDTR_pCo3kYM9uGEdGdlQ6GuU9nDajl9wjw'

export const bucket = createClient(BUCKET_URL, BUCKET_ANON_KEY)
