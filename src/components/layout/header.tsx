import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Menu, LogOut } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': '总览',
  '/todo': '待办事项',
  '/memo': '备忘录',
  '/note': '笔记',
  '/settings': '设置',
}

export function Header() {
  const location = useLocation()
  const { toggleSidebar } = useUIStore()
  const { user, signOut } = useAuthStore()

  // 匹配当前页面标题
  const title = PAGE_TITLES[location.pathname]
    || (location.pathname.startsWith('/note/') ? '笔记' : '工作台')

  const email = user?.email || ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4 shrink-0">
      {/* 侧栏切换按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* 桌面端标题 */}
      <h1 className="text-lg font-semibold hidden md:block">{title}</h1>

      {/* 移动端占位（用于底部导航） */}
      <div className="flex-1 md:hidden" />

      {/* 用户信息 */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-muted-foreground hidden sm:block max-w-[120px] truncate">
          {email}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
