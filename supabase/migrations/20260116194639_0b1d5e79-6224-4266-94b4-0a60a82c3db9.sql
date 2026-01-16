-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create own contracts" ON demo_contracts;

-- Create new INSERT policy that allows:
-- 1. Users to create their own non-demo contracts
-- 2. Admins/owners to create demo contracts
CREATE POLICY "Users can create contracts" ON demo_contracts
FOR INSERT WITH CHECK (
  (owner_user_id = auth.uid() AND is_demo = false) 
  OR 
  (is_demo = true AND is_admin_or_owner(auth.uid()))
);