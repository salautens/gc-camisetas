export type Profile = {
  id: string
  display_name: string | null
  main_club: string | null
  why_collect: string | null
  onboarding_done: boolean
  created_at: string
}

export type Shirt = {
  id: string
  user_id: string
  clube: string
  temporada: string
  versao: 'home' | 'away' | 'third' | 'goalkeeper' | 'special'
  fabricante: string | null
  condicao: 'mint' | 'excellent' | 'good' | 'worn' | null
  historia: string | null
  original_url: string | null
  processed_url: string | null
  processing_status: 'none' | 'pending' | 'done' | 'failed'
  created_at: string
}

export type ShirtInsert = Omit<Shirt, 'id' | 'user_id' | 'created_at' | 'processed_url' | 'processing_status'>
