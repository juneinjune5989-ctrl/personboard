// ===== 分类 =====
export interface Category {
  id: string
  user_id: string
  name: string
  type: 'todo' | 'note' | 'memo'
  color: string
  icon: string
  sort_order: number
  created_at: string
}

// ===== 标签 =====
export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

// ===== 待办事项 =====
export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  completed_at: string | null
  priority: number // 0-3
  due_date: string | null
  category_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // 关联数据（通过 JOIN 或额外查询获取）
  category?: Category | null
  tags?: Tag[]
}

// ===== 备忘录 =====
export interface Memo {
  id: string
  user_id: string
  title: string | null
  content: string
  color: string
  is_pinned: boolean
  category_id: string | null
  reminder_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category | null
}

// ===== 笔记 =====
export interface Note {
  id: string
  user_id: string
  title: string
  content: string | null
  format: 'markdown' | 'richtext'
  category_id: string | null
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  category?: Category | null
  tags?: Tag[]
}

// ===== 导航模块 =====
export type ModuleType = 'dashboard' | 'todo' | 'memo' | 'note' | 'settings'

// ===== 插入类型（创建新记录用） =====
export type TodoInsert = Pick<Todo, 'title'> & Partial<Pick<Todo, 'description' | 'priority' | 'due_date' | 'category_id' | 'sort_order'>>
export type MemoInsert = Pick<Memo, 'content'> & Partial<Pick<Memo, 'title' | 'color' | 'is_pinned' | 'category_id'>>
export type NoteInsert = Pick<Note, 'title'> & Partial<Pick<Note, 'content' | 'format' | 'category_id' | 'is_pinned'>>

// ===== 更新类型 =====
export type TodoUpdate = Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'completed_at' | 'priority' | 'due_date' | 'category_id' | 'sort_order'>>
export type MemoUpdate = Partial<Pick<Memo, 'title' | 'content' | 'color' | 'is_pinned' | 'category_id' | 'sort_order'>>
export type NoteUpdate = Partial<Pick<Note, 'title' | 'content' | 'format' | 'category_id' | 'is_pinned' | 'is_archived'>>
