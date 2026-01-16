-- Remover a constraint de project_type para permitir valores mais específicos
ALTER TABLE public.demo_contracts DROP CONSTRAINT IF EXISTS demo_contracts_project_type_check;