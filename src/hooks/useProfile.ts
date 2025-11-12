import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useProfile() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const createProfile = async () => {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email! }])
      }
    }

    createProfile()
  }, [user])
}
