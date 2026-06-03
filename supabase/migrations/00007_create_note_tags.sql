-- 笔记-标签关联表
CREATE TABLE note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- RLS
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own note_tags" ON note_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own note_tags" ON note_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own note_tags" ON note_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));
