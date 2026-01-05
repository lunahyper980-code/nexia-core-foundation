-- Create function to check if user has active credit request
CREATE OR REPLACE FUNCTION public.has_active_credit_request(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lovable_credit_requests
    WHERE user_id = _user_id
      AND status IN ('pending', 'reviewing', 'approved')
  )
$$;

-- Create trigger function to block duplicate active requests
CREATE OR REPLACE FUNCTION public.check_active_credit_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_active_credit_request(NEW.user_id) THEN
    RAISE EXCEPTION 'User already has an active credit request. Please wait for admin review.';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to run before INSERT
DROP TRIGGER IF EXISTS check_active_credit_request_trigger ON public.lovable_credit_requests;
CREATE TRIGGER check_active_credit_request_trigger
BEFORE INSERT ON public.lovable_credit_requests
FOR EACH ROW
EXECUTE FUNCTION public.check_active_credit_request();