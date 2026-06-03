-- 备忘录表
CREATE TABLE memos (
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

CREATE INDEX idx_memos_user ON memos(user_id, is_pinned DESC, sort_order);

-- RLS
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memos" ON memos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memos" ON memos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memos" ON memos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memos" ON memos FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_memos_updated_at
  BEFORE UPDATE ON memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE memos;
