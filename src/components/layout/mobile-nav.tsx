import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, StickyNote, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/todo', label: '待办', icon: CheckSquare },
  { path: '/memo', label: '备忘', icon: StickyNote },
  { path: '/note', label: '笔记', icon: FileText },
]

export function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="md:hidden flex items-center justify-around border-t bg-card shrink-0 h-16 safe-area-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-col items-center gap-0.5 min-w-0 px-2 py-1 text-xs transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
