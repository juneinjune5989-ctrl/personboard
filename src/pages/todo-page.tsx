import { useState } from 'react'
import { useTodos } from '@/hooks/use-todos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Todo } from '@/lib/types'

export function TodoPage() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos()
  const [newTitle, setNewTitle] = useState('')
  const [editing, setEditing] = useState<Todo | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await addTodo({ title: newTitle.trim() })
      setNewTitle('')
    } catch (e) {
      console.error(e)
    }
    setAdding(false)
  }

  const handleUpdate = async () => {
    if (!editing || !editTitle.trim()) return
    await updateTodo(editing.id, { title: editTitle.trim(), description: editDesc.trim() || null })
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    await deleteTodo(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 添加栏 */}
      <div className="flex gap-2">
        <Input
          placeholder="添加待办事项..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={adding}
        />
        <Button onClick={handleAdd} disabled={adding || !newTitle.trim()} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2">
        {(['all', 'active', 'done'] as const).map((f) => (
          <Badge
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </Badge>
        ))}
      </div>

      {/* 待办列表 */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">✨</p>
            <p className="text-sm mt-2">暂无待办事项</p>
          </div>
        ) : (
          filtered.map((todo) => (
            <Card
              key={todo.id}
              className={cn(
                'group cursor-pointer hover:shadow-sm transition-all',
                todo.completed && 'opacity-60'
              )}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id, !todo.completed)}
                  className="mt-0.5"
                />
                <div
                  className="flex-1 min-w-0"
                  onClick={() => { setEditing(todo); setEditTitle(todo.title); setEditDesc(todo.description || '') }}
                >
                  <p className={cn('text-sm font-medium truncate', todo.completed && 'line-through')}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {todo.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => { e.stopPropagation(); handleDelete(todo.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑待办</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="标题"
              autoFocus
            />
            <Input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="备注（可选）"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            <Button onClick={handleUpdate} disabled={!editTitle.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
