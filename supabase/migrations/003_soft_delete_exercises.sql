ALTER TABLE exercises ADD COLUMN deleted_at timestamptz DEFAULT NULL;

CREATE INDEX idx_exercises_active ON exercises(id) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "Users can read exercises" ON exercises;
CREATE POLICY "Users can read active exercises" ON exercises
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
