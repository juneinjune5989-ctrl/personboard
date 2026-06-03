-- 待办-标签关联表
CREATE TABLE todo_tags (
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);

-- RLS（关联表需要检查 todo 的所属权）
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todo_tags" ON todo_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own todo_tags" ON todo_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own todo_tags" ON todo_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_tags.todo_id AND todos.user_id = auth.uid()
  ));
