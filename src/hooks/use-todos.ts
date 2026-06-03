import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { Todo, TodoInsert, TodoUpdate } from '@/lib/types'

export function useTodos() {
  const user = useAuthStore((s) => s.user)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  // 获取所有待办
  const fetchTodos = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) setTodos(data as Todo[])
    setLoading(false)
  }, [user])

  // 初始加载 + 实时订阅
  useEffect(() => {
    if (!user) return

    fetchTodos()

    const channel = supabase
      .channel('todos-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user.id}` },
        () => { fetchTodos() }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user, fetchTodos])

  // 新增
  const addTodo = async (data: TodoInsert) => {
    if (!user) return
    const { error } = await supabase.from('todos').insert({ ...data, user_id: user.id })
    if (error) throw error
  }

  // 更新
  const updateTodo = async (id: string, data: TodoUpdate) => {
    const { error } = await supabase.from('todos').update(data).eq('id', id)
    if (error) throw error
  }

  // 删除
  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
  }

  // 切换完成状态
  const toggleTodo = async (id: string, completed: boolean) => {
    await updateTodo(id, {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
  }

  return { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, refresh: fetchTodos }
}
