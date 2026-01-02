import { Brain, Info, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NexiaData {
  projectName?: string;
  companyName?: string;
  sectorNiche?: string;
  targetAudience?: string;
  primaryGoal?: string;
  mainProblem?: string;
  solutionType?: string;
  diagnosisSummary?: string;
  strategySummary?: string;
  focusArea?: string;
  planningId?: string;
  clientId?: string;
  mode?: 'simple' | 'full';
}

interface NexiaOriginBannerProps {
  nexiaData: NexiaData;
  onDismiss?: () => void;
}

export function NexiaOriginBanner({ nexiaData, onDismiss }: NexiaOriginBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert className="border-primary/30 bg-primary/5 mb-6">
      <Brain className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground font-medium">
            Essas informações vieram do Nexia
          </p>
          <p className="text-xs text-muted-foreground">
            {nexiaData.mode === 'full' 
              ? 'Dados do planejamento estratégico. Você pode editar tudo.'
              : 'Dados do briefing simples. Você pode editar tudo.'
            }
          </p>
          {nexiaData.companyName && (
            <p className="text-xs text-muted-foreground">
              Cliente: <span className="text-foreground">{nexiaData.companyName}</span>
              {nexiaData.sectorNiche && <span> • {nexiaData.sectorNiche}</span>}
            </p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 shrink-0" 
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Utility to parse Nexia data from URL params
 */
export function parseNexiaParams(searchParams: URLSearchParams): NexiaData | null {
  const fromNexia = searchParams.get('fromNexia');
  if (fromNexia !== 'true') return null;

  return {
    projectName: searchParams.get('projectName') || undefined,
    companyName: searchParams.get('companyName') || searchParams.get('projectName') || undefined,
    sectorNiche: searchParams.get('sectorNiche') || undefined,
    targetAudience: searchParams.get('targetAudience') || undefined,
    primaryGoal: searchParams.get('primaryGoal') || searchParams.get('mainTask') || undefined,
    mainProblem: searchParams.get('mainProblem') || searchParams.get('mainBenefit') || undefined,
    solutionType: searchParams.get('solutionType') || undefined,
    diagnosisSummary: searchParams.get('diagnosisSummary') || undefined,
    strategySummary: searchParams.get('strategySummary') || undefined,
    focusArea: searchParams.get('focusArea') || undefined,
    planningId: searchParams.get('planningId') || undefined,
    clientId: searchParams.get('clientId') || undefined,
    mode: (searchParams.get('mode') as 'simple' | 'full') || 'simple',
  };
}
