-- 笔记表
CREATE TABLE notes (
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

CREATE INDEX idx_notes_user ON notes(user_id, is_archived, is_pinned DESC, updated_at DESC);

-- 全文搜索索引（需要 pg_trgm）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_notes_search ON notes
  USING gin (coalesce(title, '') || ' ' || coalesce(content, '') gin_trgm_ops);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
