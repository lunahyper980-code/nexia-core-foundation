import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { generateReferralCode } from '@/lib/referral';

export type AffiliateProfileStatus = 'inactive' | 'active' | 'blocked';
export type AffiliateProgramType = 'sale_20' | 'recurring_10';
export type AffiliateReferralStatus = 'signed_up' | 'converted' | 'paid' | 'cancelled';
export type AffiliateCommissionStatus = 'pending' | 'available' | 'paid' | 'void';

export interface AffiliateProfile {
  id: string;
  user_id: string;
  workspace_id: string;
  referral_code: string;
  status: AffiliateProfileStatus;
  program_type: AffiliateProgramType | null;
  commission_rate: number | null;
  commission_label: string | null;
  activated_at: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_user_id: string;
  referred_user_id: string;
  referred_workspace_id: string | null;
  referred_email: string | null;
  referral_code: string;
  status: AffiliateReferralStatus;
  subscribed_plan_name: string | null;
  subscribed_amount: number | null;
  billing_cycle: string | null;
  currency: string;
  commission_rate: number;
  commission_amount: number;
  commission_status: AffiliateCommissionStatus;
  created_at: string;
  updated_at: string;
  converted_at: string | null;
}

export const AFFILIATE_PROGRAM_OPTIONS = {
  sale_20: {
    type: 'sale_20' as const,
    title: 'Ganhe 20% por Venda',
    description: 'Comissão direta em cada indicação aprovada.',
    commissionRate: 20,
    label: '20% por venda',
  },
  recurring_10: {
    type: 'recurring_10' as const,
    title: 'Ganhe 10% Recorrente',
    description: 'Modelo recorrente atualmente indisponível.',
    commissionRate: 10,
    label: '10% recorrente',
  },
};

export function useAffiliateProgram() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAffiliateData = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setReferrals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Erro ao buscar perfil de afiliado:', profileError);
      setProfile(null);
      setReferrals([]);
      setLoading(false);
      return;
    }

    const affiliateProfile = (profileData as AffiliateProfile | null) ?? null;
    setProfile(affiliateProfile);

    const { data: referralData, error: referralError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_user_id', user.id)
      .order('created_at', { ascending: false });

    if (referralError) {
      console.error('Erro ao buscar indicações:', referralError);
      setReferrals([]);
    } else {
      setReferrals((referralData as AffiliateReferral[] | null) ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]);

  const activateProgram = useCallback(async (programType: AffiliateProgramType) => {
    if (!user?.id) throw new Error('Usuário não autenticado.');
    if (!workspace?.id) throw new Error('Workspace não encontrado.');

    const selectedProgram = AFFILIATE_PROGRAM_OPTIONS[programType];
    if (!selectedProgram || programType !== 'sale_20') {
      throw new Error('Este modelo de afiliação ainda não está disponível.');
    }

    setSaving(true);

    try {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const referralCode = generateReferralCode(
          user.user_metadata?.full_name || workspace.operation_name || 'nexia'
        );

        const { data, error } = await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: user.id,
            workspace_id: workspace.id,
            referral_code: referralCode,
            status: 'active',
            program_type: selectedProgram.type,
            commission_rate: selectedProgram.commissionRate,
            commission_label: selectedProgram.label,
            activated_at: new Date().toISOString(),
            locked_at: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (!error && data) {
          await supabase.from('activity_logs').insert({
            workspace_id: workspace.id,
            user_id: user.id,
            type: 'affiliate_program_activated',
            message: 'Programa de afiliados ativado',
            metadata: {
              program_type: selectedProgram.type,
              referral_code: referralCode,
            },
          });

          setProfile(data as AffiliateProfile);
          await fetchAffiliateData();
          return data as AffiliateProfile;
        }

        if (error?.code !== '23505') {
          throw error;
        }
      }

      throw new Error('Não foi possível gerar um código exclusivo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [fetchAffiliateData, user, workspace]);

  const stats = useMemo(() => {
    const totalReferrals = referrals.length;
    const totalConverted = referrals.filter((referral) => referral.status === 'converted' || referral.status === 'paid').length;
    const totalCommissionAvailable = referrals
      .filter((referral) => referral.commission_status === 'available')
      .reduce((sum, referral) => sum + Number(referral.commission_amount || 0), 0);
    const totalCommissionPaid = referrals
      .filter((referral) => referral.commission_status === 'paid')
      .reduce((sum, referral) => sum + Number(referral.commission_amount || 0), 0);

    return {
      totalReferrals,
      totalConverted,
      totalCommissionAvailable,
      totalCommissionPaid,
      totalCommissionGenerated: totalCommissionAvailable + totalCommissionPaid,
    };
  }, [referrals]);

  return {
    profile,
    referrals,
    stats,
    loading,
    saving,
    activateProgram,
    refetch: fetchAffiliateData,
  };
}
