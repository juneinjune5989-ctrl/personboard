import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { AppShell } from '@/components/layout/app-shell'
import { LoginPage } from '@/pages/login-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { TodoPage } from '@/pages/todo-page'
import { MemoPage } from '@/pages/memo-page'
import { NoteListPage } from '@/pages/note-list-page'
import { NoteEditPage } from '@/pages/note-edit-page'

function App() {
  const { user, loading, init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // 未登录 → 登录页
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  // 已登录 → 主应用
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/memo" element={<MemoPage />} />
        <Route path="/note" element={<NoteListPage />} />
        <Route path="/note/:id" element={<NoteEditPage />} />
        <Route path="/note/new" element={<NoteEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
