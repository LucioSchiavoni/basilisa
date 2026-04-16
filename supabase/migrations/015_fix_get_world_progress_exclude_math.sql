CREATE OR REPLACE FUNCTION public.get_world_progress(p_patient_id uuid)
RETURNS TABLE(world_name text, total_exercises bigint, completed_exercises bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.name AS world_name,
    COUNT(DISTINCT e.id) AS total_exercises,
    COUNT(DISTINCT s.exercise_id) AS completed_exercises
  FROM worlds w
  JOIN world_exercises we ON we.world_id = w.id
  JOIN exercises e ON e.id = we.exercise_id
  JOIN exercise_types et ON et.id = e.exercise_type_id
  LEFT JOIN assignment_sessions s
    ON s.exercise_id = e.id
    AND s.patient_id = p_patient_id
    AND s.is_completed = true
  WHERE
    w.is_active = true
    AND e.is_active = true
    AND e.deleted_at IS NULL
    AND et.name <> 'math'
  GROUP BY w.name;
$$;
