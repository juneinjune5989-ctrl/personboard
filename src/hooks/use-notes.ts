import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { Note, NoteInsert, NoteUpdate } from '@/lib/types'

export function useNotes() {
  const user = useAuthStore((s) => s.user)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (!error && data) setNotes(data as Note[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchNotes()

    const channel = supabase
      .channel('notes-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
        () => { fetchNotes() }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user, fetchNotes])

  const addNote = async (data: NoteInsert) => {
    if (!user) return null
    const { data: result, error } = await supabase
      .from('notes')
      .insert({ ...data, user_id: user.id })
      .select('id')
      .single()
    if (error) throw error
    return result.id as string
  }

  const updateNote = async (id: string, data: NoteUpdate) => {
    const { error } = await supabase.from('notes').update(data).eq('id', id)
    if (error) throw error
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
  }

  // 获取单条笔记
  const getNote = async (id: string): Promise<Note | null> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data as Note
  }

  return { notes, loading, addNote, updateNote, deleteNote, getNote, refresh: fetchNotes }
}
