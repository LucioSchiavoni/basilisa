ALTER TABLE patient_assignments
  DROP CONSTRAINT patient_assignments_status_check;

ALTER TABLE patient_assignments
  ADD CONSTRAINT patient_assignments_status_check
  CHECK (status IN ('assigned', 'pending', 'in_progress', 'completed', 'cancelled'));
