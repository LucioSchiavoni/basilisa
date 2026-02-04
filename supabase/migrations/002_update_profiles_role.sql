-- Actualizar constraint de rol para incluir 'admin' si existe
-- Si tu tabla profiles ya tiene un CHECK constraint para role, ejecuta:
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Agregar nuevo constraint que incluye admin
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('patient', 'expert', 'admin'));

-- Si el campo role no tiene constraint, simplemente actualiza un usuario a admin:
-- UPDATE profiles SET role = 'admin' WHERE id = 'TU_USER_ID';

-- Política para que admins puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Política para que admins puedan actualizar perfiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
