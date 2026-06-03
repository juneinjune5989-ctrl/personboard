import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Header } from './header'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 桌面端侧栏 */}
      <Sidebar />

      {/* 主区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* 移动端底部导航 */}
      <MobileNav />
    </div>
  )
}
