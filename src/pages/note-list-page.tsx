import { useNavigate } from 'react-router-dom'
import { useNotes } from '@/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function NoteListPage() {
  const navigate = useNavigate()
  const { notes, loading, deleteNote } = useNotes()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteNote(deleteId)
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{notes.length} 篇笔记</p>
        </div>
        <Button onClick={() => navigate('/note/new')} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          新建笔记
        </Button>
      </div>

      {/* 笔记列表 */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground mt-3">还没有笔记</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => navigate('/note/new')}
          >
            <Plus className="h-4 w-4 mr-1" />
            写第一篇
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="group cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate(`/note/${note.id}`)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{note.title || '无标题'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                    </span>
                    {note.content && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {note.content.slice(0, 60)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 md:flex hidden"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(note.id) }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认 */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>删除笔记</DialogTitle>
            <DialogDescription>确认删除这篇笔记？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
