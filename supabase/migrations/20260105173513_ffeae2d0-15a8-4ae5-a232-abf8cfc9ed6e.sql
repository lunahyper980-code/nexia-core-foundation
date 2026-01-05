-- Create the trigger to enforce the rule before insert
CREATE TRIGGER enforce_single_active_credit_request
  BEFORE INSERT ON public.lovable_credit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_active_credit_request();