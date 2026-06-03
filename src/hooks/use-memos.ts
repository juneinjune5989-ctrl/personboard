import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { Memo, MemoInsert, MemoUpdate } from '@/lib/types'

export function useMemos() {
  const user = useAuthStore((s) => s.user)
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemos = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) setMemos(data as Memo[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchMemos()

    const channel = supabase
      .channel('memos-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'memos', filter: `user_id=eq.${user.id}` },
        () => { fetchMemos() }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user, fetchMemos])

  const addMemo = async (data: MemoInsert) => {
    if (!user) return
    const { error } = await supabase.from('memos').insert({ ...data, user_id: user.id })
    if (error) throw error
  }

  const updateMemo = async (id: string, data: MemoUpdate) => {
    const { error } = await supabase.from('memos').update(data).eq('id', id)
    if (error) throw error
  }

  const deleteMemo = async (id: string) => {
    const { error } = await supabase.from('memos').delete().eq('id', id)
    if (error) throw error
  }

  return { memos, loading, addMemo, updateMemo, deleteMemo, refresh: fetchMemos }
}
