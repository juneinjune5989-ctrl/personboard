import { useNavigate } from 'react-router-dom'
import { useTodos } from '@/hooks/use-todos'
import { useMemos } from '@/hooks/use-memos'
import { useNotes } from '@/hooks/use-notes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, StickyNote, FileText, ChevronRight } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { todos } = useTodos()
  const { memos } = useMemos()
  const { notes } = useNotes()

  const todoDone = todos.filter((t) => t.completed).length
  const todoTotal = todos.length

  const cards = [
    {
      title: '待办事项',
      icon: CheckSquare,
      color: 'text-blue-600 bg-blue-50',
      stat: todoTotal > 0 ? `${todoDone}/${todoTotal}` : '—',
      desc: '已完成 / 全部',
      path: '/todo',
    },
    {
      title: '备忘录',
      icon: StickyNote,
      color: 'text-amber-600 bg-amber-50',
      stat: memos.length.toString(),
      desc: '条便签',
      path: '/memo',
    },
    {
      title: '笔记',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50',
      stat: notes.length.toString(),
      desc: '篇笔记',
      path: '/note',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">你好，👋</h2>
        <p className="text-muted-foreground mt-1">今天想做点什么？</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.path}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.stat}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {card.desc}
                <ChevronRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 最近笔记 */}
      {notes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">最近笔记</h3>
          <div className="space-y-2">
            {notes.slice(0, 5).map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{note.title || '无标题'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
