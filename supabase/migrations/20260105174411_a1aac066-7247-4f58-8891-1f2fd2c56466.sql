-- Allow the additional status 'sent' on lovable_credit_requests
-- Existing constraint currently allows: pending, reviewing, approved, fulfilled, rejected

ALTER TABLE public.lovable_credit_requests
  DROP CONSTRAINT IF EXISTS lovable_credit_requests_status_check;

ALTER TABLE public.lovable_credit_requests
  ADD CONSTRAINT lovable_credit_requests_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'pending'::text,
        'reviewing'::text,
        'approved'::text,
        'fulfilled'::text,
        'rejected'::text,
        'sent'::text
      ]
    )
  );
