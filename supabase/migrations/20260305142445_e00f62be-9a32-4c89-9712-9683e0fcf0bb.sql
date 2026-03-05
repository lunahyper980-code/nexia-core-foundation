-- Affiliate program types
CREATE TYPE public.affiliate_profile_status AS ENUM ('inactive', 'active', 'blocked');
CREATE TYPE public.affiliate_program_type AS ENUM ('sale_20', 'recurring_10');
CREATE TYPE public.affiliate_referral_status AS ENUM ('signed_up', 'converted', 'paid', 'cancelled');
CREATE TYPE public.affiliate_commission_status AS ENUM ('pending', 'available', 'paid', 'void');

-- Affiliate profile for each user who joins the referral program
CREATE TABLE public.affiliate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  status public.affiliate_profile_status NOT NULL DEFAULT 'inactive',
  program_type public.affiliate_program_type,
  commission_rate NUMERIC(5,2),
  commission_label TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_workspace_id ON public.affiliate_profiles(workspace_id);
CREATE UNIQUE INDEX idx_affiliate_profiles_referral_code_lower ON public.affiliate_profiles(LOWER(referral_code));

ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate profile"
ON public.affiliate_profiles
FOR SELECT
USING ((auth.uid() = user_id) OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can create own affiliate profile"
ON public.affiliate_profiles
FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND user_owns_workspace(workspace_id));

CREATE POLICY "Users can update own affiliate profile"
ON public.affiliate_profiles
FOR UPDATE
USING ((auth.uid() = user_id) OR is_admin_or_owner(auth.uid()))
WITH CHECK ((auth.uid() = user_id) OR is_admin_or_owner(auth.uid()));

-- Referral records generated from affiliate links
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  referred_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  referred_email TEXT,
  referral_code TEXT NOT NULL,
  status public.affiliate_referral_status NOT NULL DEFAULT 'signed_up',
  subscribed_plan_name TEXT,
  subscribed_amount NUMERIC(10,2),
  billing_cycle TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_status public.affiliate_commission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_affiliate_referrals_affiliate_user_id ON public.affiliate_referrals(affiliate_user_id);
CREATE INDEX idx_affiliate_referrals_referred_user_id ON public.affiliate_referrals(referred_user_id);
CREATE INDEX idx_affiliate_referrals_status ON public.affiliate_referrals(status);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals"
ON public.affiliate_referrals
FOR SELECT
USING ((auth.uid() = affiliate_user_id) OR (auth.uid() = referred_user_id) OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Referred users can create own referral record"
ON public.affiliate_referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "Referred users can update own referral record"
ON public.affiliate_referrals
FOR UPDATE
USING ((auth.uid() = referred_user_id) OR is_admin_or_owner(auth.uid()))
WITH CHECK ((auth.uid() = referred_user_id) OR is_admin_or_owner(auth.uid()));

-- Subscription metadata used to calculate affiliate commission when available
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS billing_cycle TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- Keep timestamps fresh
CREATE TRIGGER update_affiliate_profiles_updated_at
BEFORE UPDATE ON public.affiliate_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_referrals_updated_at
BEFORE UPDATE ON public.affiliate_referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Claim or sync the current user's referral relation securely
CREATE OR REPLACE FUNCTION public.sync_affiliate_referral(_referral_code TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _workspace_id UUID;
  _email TEXT;
  _normalized_code TEXT := NULLIF(BTRIM(_referral_code), '');
  _affiliate public.affiliate_profiles%ROWTYPE;
  _referral public.affiliate_referrals%ROWTYPE;
  _subscription RECORD;
  _commission NUMERIC(10,2);
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO _workspace_id
  FROM public.workspaces
  WHERE user_id = _user_id
  ORDER BY created_at ASC
  LIMIT 1;

  SELECT email INTO _email
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1;

  SELECT * INTO _referral
  FROM public.affiliate_referrals
  WHERE referred_user_id = _user_id
  LIMIT 1;

  IF _referral.id IS NULL AND _normalized_code IS NOT NULL THEN
    SELECT * INTO _affiliate
    FROM public.affiliate_profiles
    WHERE LOWER(referral_code) = LOWER(_normalized_code)
      AND status = 'active'
    LIMIT 1;

    IF _affiliate.id IS NULL THEN
      RETURN jsonb_build_object('status', 'invalid_code');
    END IF;

    IF _affiliate.user_id = _user_id THEN
      RETURN jsonb_build_object('status', 'self_referral');
    END IF;

    INSERT INTO public.affiliate_referrals (
      affiliate_user_id,
      referred_user_id,
      referred_workspace_id,
      referred_email,
      referral_code,
      commission_rate
    ) VALUES (
      _affiliate.user_id,
      _user_id,
      _workspace_id,
      _email,
      _affiliate.referral_code,
      COALESCE(_affiliate.commission_rate, 20)
    )
    ON CONFLICT (referred_user_id) DO NOTHING
    RETURNING * INTO _referral;

    IF _referral.id IS NULL THEN
      SELECT * INTO _referral
      FROM public.affiliate_referrals
      WHERE referred_user_id = _user_id
      LIMIT 1;
    END IF;
  END IF;

  IF _referral.id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_referral');
  END IF;

  SELECT plan_name, amount, billing_cycle, currency, status
  INTO _subscription
  FROM public.subscriptions
  WHERE user_id = _user_id
  ORDER BY updated_at DESC
  LIMIT 1;

  IF _subscription.status = 'active' AND COALESCE(_subscription.amount, 0) > 0 THEN
    _commission := ROUND((COALESCE(_subscription.amount, 0) * COALESCE(_referral.commission_rate, 20) / 100.0)::numeric, 2);

    UPDATE public.affiliate_referrals
    SET status = 'converted',
        subscribed_plan_name = _subscription.plan_name,
        subscribed_amount = _subscription.amount,
        billing_cycle = _subscription.billing_cycle,
        currency = COALESCE(_subscription.currency, 'BRL'),
        commission_amount = _commission,
        commission_status = CASE WHEN _commission > 0 THEN 'available' ELSE commission_status END,
        converted_at = COALESCE(converted_at, now()),
        updated_at = now()
    WHERE id = _referral.id
    RETURNING * INTO _referral;

    RETURN jsonb_build_object(
      'status', 'converted',
      'referral_id', _referral.id,
      'commission_amount', _referral.commission_amount,
      'commission_status', _referral.commission_status
    );
  END IF;

  RETURN jsonb_build_object(
    'status', CASE WHEN _normalized_code IS NOT NULL THEN 'claimed' ELSE 'synced' END,
    'referral_id', _referral.id,
    'commission_amount', _referral.commission_amount,
    'commission_status', _referral.commission_status
  );
END;
$$;