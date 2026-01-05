import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUserRole } from '@/contexts/UserRoleContext';

// Membros da equipe com valores base FIXOS
const BASE_TEAM_MEMBERS = [
  { id: 1, name: 'Lucas Mendes', baseVolume: 4200 },
  { id: 2, name: 'Fernanda Costa', baseVolume: 3850 },
  { id: 3, name: 'Rafael Oliveira', baseVolume: 3400 },
  { id: 4, name: 'Camila Rodrigues', baseVolume: 2950 },
  { id: 5, name: 'Bruno Almeida', baseVolume: 2600 },
  { id: 6, name: 'Ana Beatriz', baseVolume: 2350 },
  { id: 7, name: 'Pedro Henrique', baseVolume: 1980 },
  { id: 8, name: 'Juliana Martins', baseVolume: 1750 },
];

const TEAM_STATUSES = ['Estável', 'Em crescimento', 'Performance positiva'];
const INCREMENT_INTERVAL_MS = 48 * 60 * 60 * 1000;

export interface TeamMember {
  id: number;
  name: string;
  baseVolume: number;
  volume: number;
  progress: number;
  isGrowing: boolean;
}

export interface TeamStats {
  activeMembers: number;
  totalVolume: number;
  averageTicket: number;
  status: string;
}

export interface TeamData {
  members: TeamMember[];
  stats: TeamStats;
  completedCycles: number;
}

// Gerador pseudo-aleatório determinístico
function seededRandom(cycle: number, memberId: number): number {
  const x = Math.sin((cycle + 1) * 9973 + memberId * 7919) * 10000;
  return x - Math.floor(x);
}

function getMemberCycleIncrement(cycle: number, memberId: number): number {
  const rand = seededRandom(cycle, memberId);
  const baseIncrement = 250 + rand * 150;
  const variation = (seededRandom(cycle, memberId + 1000) - 0.5) * 30;
  return Math.round(baseIncrement + variation);
}

function memberGrowsInCycle(cycle: number, memberId: number): boolean {
  return seededRandom(cycle, memberId + 500) > 0.15;
}

// Calcula dados da equipe baseado na data de referência
function calculateTeamData(referenceDate: Date): TeamData {
  const now = Date.now();
  const elapsed = now - referenceDate.getTime();
  const completedCycles = Math.max(0, Math.floor(elapsed / INCREMENT_INTERVAL_MS));

  const members: TeamMember[] = BASE_TEAM_MEMBERS.map((member) => {
    let accumulatedGrowth = 0;
    let isGrowingThisCycle = false;

    for (let c = 0; c < completedCycles; c++) {
      if (memberGrowsInCycle(c, member.id)) {
        accumulatedGrowth += getMemberCycleIncrement(c, member.id);
      }
    }

    if (completedCycles > 0) {
      isGrowingThisCycle = memberGrowsInCycle(completedCycles - 1, member.id);
    }

    const totalVolume = member.baseVolume + accumulatedGrowth;
    const baseProgress = 35 + (seededRandom(0, member.id) * 20);
    const progressGrowth = completedCycles * (2 + seededRandom(completedCycles, member.id) * 2);
    const progress = Math.min(92, Math.round(baseProgress + progressGrowth));

    return {
      ...member,
      volume: totalVolume,
      progress,
      isGrowing: isGrowingThisCycle,
    };
  });

  members.sort((a, b) => b.volume - a.volume);

  const totalVolume = members.reduce((sum, m) => sum + m.volume, 0);
  const averageTicket = Math.round(totalVolume / members.length);
  const statusIndex = completedCycles % TEAM_STATUSES.length;
  const status = TEAM_STATUSES[statusIndex];

  return {
    members,
    stats: {
      activeMembers: members.length,
      totalVolume,
      averageTicket,
      status,
    },
    completedCycles,
  };
}

export function useTeamMetrics() {
  const { workspace } = useWorkspace();
  const { isAdminOrOwner } = useUserRole();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminOrOwner || !workspace) {
      setLoading(false);
      return;
    }

    const fetchOrCreateTeamMetrics = async () => {
      try {
        // Buscar métricas existentes do backend
        const { data: existingMetrics, error: fetchError } = await supabase
          .from('team_metrics')
          .select('*')
          .eq('workspace_id', workspace.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching team metrics:', fetchError);
          setLoading(false);
          return;
        }

        let referenceDate: Date;

        if (existingMetrics) {
          referenceDate = new Date(existingMetrics.reference_date);
        } else {
          // Criar novo registro no backend
          referenceDate = new Date();

          const { error: insertError } = await supabase
            .from('team_metrics')
            .insert({
              workspace_id: workspace.id,
              reference_date: referenceDate.toISOString(),
              completed_cycles: 0,
              team_data: {},
            });

          if (insertError) {
            console.error('Error creating team metrics:', insertError);
          }
        }

        const data = calculateTeamData(referenceDate);
        setTeamData(data);

      } catch (error) {
        console.error('Error in team metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateTeamMetrics();

    // Atualiza a cada minuto
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('team_metrics')
        .select('reference_date')
        .eq('workspace_id', workspace.id)
        .maybeSingle();

      if (data) {
        const updatedData = calculateTeamData(new Date(data.reference_date));
        setTeamData(updatedData);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAdminOrOwner, workspace]);

  return { teamData, loading };
}
