import { useState } from 'react'
import { useMemos } from '@/hooks/use-memos'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Pin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Memo } from '@/lib/types'

const MEMO_COLORS = [
  '#FEF3C7', // 黄
  '#DBEAFE', // 蓝
  '#D1FAE5', // 绿
  '#FCE7F3', // 粉
  '#EDE9FE', // 紫
  '#F3F4F6', // 灰
]

export function MemoPage() {
  const { memos, loading, addMemo, updateMemo, deleteMemo } = useMemos()
  const [content, setContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Memo | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAdd = async () => {
    if (!content.trim()) return
    setAdding(true)
    try {
      await addMemo({ content: content.trim() })
      setContent('')
    } catch (e) {
      console.error(e)
    }
    setAdding(false)
  }

  const handleUpdate = async () => {
    if (!editing || !editContent.trim()) return
    await updateMemo(editing.id, { content: editContent.trim(), color: editColor })
    setEditing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 快速添加 */}
      <Card>
        <CardContent className="p-3">
          <Textarea
            placeholder="快速记一笔..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 shadow-none resize-none p-0 min-h-[60px] focus-visible:ring-0"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={adding || !content.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 便签网格 */}
      {memos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">📝</p>
          <p className="text-sm mt-2">还没有备忘录</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memos.map((memo) => (
            <Card
              key={memo.id}
              className="group relative break-inside-avoid hover:shadow-md transition-shadow"
              style={{ backgroundColor: memo.color || '#FEF3C7' }}
            >
              {/* 置顶标记 */}
              {memo.is_pinned && (
                <Pin className="absolute top-2 right-2 h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              )}
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap line-clamp-6">{memo.content}</p>
                <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-500">
                    {new Date(memo.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(memo)
                        setEditContent(memo.content)
                        setEditColor(memo.color || '#FEF3C7')
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteMemo(memo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
                {/* 移动端始终显示操作按钮 */}
                <div className="flex items-center justify-between mt-3 md:hidden">
                  <span className="text-xs text-gray-500">
                    {new Date(memo.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(memo)
                        setEditContent(memo.content)
                        setEditColor(memo.color || '#FEF3C7')
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteMemo(memo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑备忘</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              {MEMO_COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    editColor === c ? 'border-primary scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setEditColor(c)}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            <Button onClick={handleUpdate} disabled={!editContent.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
