import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useNotes } from '@/hooks/use-notes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useDebouncedCallback } from '@/hooks/use-debounce'

export function NoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getNote, addNote, updateNote } = useNotes()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [noteId, setNoteId] = useState<string | null>(id || null)

  // 加载已有笔记
  useEffect(() => {
    if (!id) return
    getNote(id).then((note) => {
      if (note) {
        setTitle(note.title)
        setContent(note.content || '')
        setNoteId(note.id)
      }
      setLoading(false)
    })
  }, [id, getNote])

  // 新建笔记
  const createNote = async () => {
    if (!title.trim()) return
    const newId = await addNote({ title: title.trim(), content, format: 'markdown' })
    if (newId) {
      setNoteId(newId)
      // 更新 URL
      navigate(`/note/${newId}`, { replace: true })
    }
  }

  // 自动保存（防抖）
  const autoSave = useDebouncedCallback(async (newTitle: string, newContent: string) => {
    if (!noteId || !newTitle.trim()) return
    setSaving(true)
    setSaved(false)
    try {
      await updateNote(noteId, { title: newTitle.trim(), content: newContent })
      setSaved(true)
    } catch (e) {
      console.error('保存失败', e)
    }
    setSaving(false)
  }, 800)

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (noteId) autoSave(v, content)
  }

  const handleContentChange = (v: string) => {
    setContent(v)
    if (noteId) autoSave(title, v)
  }

  // 手动保存
  const handleSave = async () => {
    if (noteId) {
      setSaving(true)
      await updateNote(noteId, { title: title.trim(), content })
      setSaving(false)
      setSaved(true)
    } else {
      await createNote()
    }
  }

  const handleBack = () => navigate('/note')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* 顶部栏 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {saving ? '保存中...' : saved ? '已保存 ✓' : ''}
        </span>
        <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
          <Save className="h-3.5 w-3.5 mr-1" />
          保存
        </Button>
      </div>

      {/* 编辑器 */}
      <Input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="笔记标题"
        className="text-xl font-bold border-0 shadow-none px-0 focus-visible:ring-0"
      />
      <Textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="开始写笔记... (支持 Markdown)"
        className="min-h-[50vh] border-0 shadow-none resize-none px-0 focus-visible:ring-0 text-base leading-relaxed"
      />
    </div>
  )
}
