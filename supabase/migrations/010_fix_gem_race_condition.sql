ALTER TABLE gem_transactions
ADD CONSTRAINT gem_transactions_session_source_unique
UNIQUE (session_id, source);

CREATE OR REPLACE FUNCTION increment_user_gems(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE user_gems
  SET
    total_gems = total_gems + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
$$;
