-- ========================================
-- 工作台 - 一键建表脚本
-- 复制整段到 Supabase SQL Editor 执行
-- ========================================

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('todo', 'note', 'memo')),
  color       TEXT DEFAULT '#6B7280',
  icon        TEXT DEFAULT '📋',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name, type)
);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- 2. 标签表
CREATE TABLE IF NOT EXISTS tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#3B82F6',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tags" ON tags;
CREATE POLICY "Users can view own tags" ON tags FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own tags" ON tags;
CREATE POLICY "Users can insert own tags" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tags" ON tags;
CREATE POLICY "Users can update own tags" ON tags FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own tags" ON tags;
CREATE POLICY "Users can delete own tags" ON tags FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE tags;

-- 3. 自动更新时间的函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  completed     BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  priority      SMALLINT DEFAULT 0 CHECK (priority BETWEEN 0 AND 3),
  due_date      DATE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id, completed, sort_order);
CREATE INDEX IF NOT EXISTS idx_todos_due ON todos(user_id, due_date) WHERE due_date IS NOT NULL;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
CREATE POLICY "Users can update own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trg_todos_updated_at ON todos;
CREATE TRIGGER trg_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- 5. 待办-标签关联
CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own todo_tags" ON todo_tags;
CREATE POLICY "Users can view own todo_tags" ON todo_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own todo_tags" ON todo_tags;
CREATE POLICY "Users can insert own todo_tags" ON todo_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete own todo_tags" ON todo_tags;
CREATE POLICY "Users can delete own todo_tags" ON todo_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()));

-- 6. 备忘录表
CREATE TABLE IF NOT EXISTS memos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  content     TEXT NOT NULL,
  color       TEXT DEFAULT '#FEF3C7',
  is_pinned   BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  reminder_at TIMESTAMPTZ,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memos_user ON memos(user_id, is_pinned DESC, sort_order);
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memos" ON memos;
CREATE POLICY "Users can view own memos" ON memos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own memos" ON memos;
CREATE POLICY "Users can insert own memos" ON memos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own memos" ON memos;
CREATE POLICY "Users can update own memos" ON memos FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own memos" ON memos;
CREATE POLICY "Users can delete own memos" ON memos FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trg_memos_updated_at ON memos;
CREATE TRIGGER trg_memos_updated_at BEFORE UPDATE ON memos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE memos;

-- 7. 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  format       TEXT DEFAULT 'markdown' CHECK (format IN ('markdown', 'richtext')),
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_pinned    BOOLEAN DEFAULT false,
  is_archived  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id, is_archived, is_pinned DESC, updated_at DESC);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes
  USING gin ((coalesce(title, '') || ' ' || coalesce(content, '')) gin_trgm_ops);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- 8. 笔记-标签关联
CREATE TABLE IF NOT EXISTS note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own note_tags" ON note_tags;
CREATE POLICY "Users can view own note_tags" ON note_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own note_tags" ON note_tags;
CREATE POLICY "Users can insert own note_tags" ON note_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete own note_tags" ON note_tags;
CREATE POLICY "Users can delete own note_tags" ON note_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()));

-- 完成！
SELECT '所有表创建完成！' AS status;
