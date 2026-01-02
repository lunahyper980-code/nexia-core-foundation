import { useState, useEffect, useRef } from 'react';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { TrendingUp, FolderKanban, FileText, Wallet } from 'lucide-react';

interface StatusOperacaoProps {
  initialProjectsCount?: number;
  initialProposalsCount?: number;
  initialPipelineValue?: number;
  initialAverageTicket?: number;
  isOwner?: boolean;
}

const getStatusConfig = (projectsCount: number) => {
  if (projectsCount === 0) {
    return {
      status: 'Iniciando Jornada',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted/30',
      icon: '⚪',
    };
  }
  if (projectsCount === 1) {
    return {
      status: 'Primeiro Projeto Criado',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      icon: '🟢',
    };
  }
  if (projectsCount <= 3) {
    return {
      status: 'Operação Ativa',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      icon: '🔵',
    };
  }
  return {
    status: 'Pipeline em Crescimento',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: '🟣',
  };
};

export function StatusOperacao({ 
  initialProjectsCount = 0, 
  initialProposalsCount = 0,
  initialPipelineValue = 0,
  initialAverageTicket = 0,
  isOwner = false
}: StatusOperacaoProps) {
  const [projectsCount, setProjectsCount] = useState(initialProjectsCount);
  const [proposalsCount, setProposalsCount] = useState(initialProposalsCount);
  const [valorProjetos, setValorProjetos] = useState(initialPipelineValue);
  const [valorMedio, setValorMedio] = useState(initialAverageTicket);
  const [isUpdating, setIsUpdating] = useState(false);

  const prevProps = useRef({
    initialProjectsCount,
    initialProposalsCount,
    initialPipelineValue,
    initialAverageTicket,
  });

  // Sincroniza com props quando mudam (e destaca apenas quando muda por “virada” de período)
  useEffect(() => {
    const changed =
      prevProps.current.initialProjectsCount !== initialProjectsCount ||
      prevProps.current.initialProposalsCount !== initialProposalsCount ||
      prevProps.current.initialPipelineValue !== initialPipelineValue ||
      prevProps.current.initialAverageTicket !== initialAverageTicket;

    prevProps.current = {
      initialProjectsCount,
      initialProposalsCount,
      initialPipelineValue,
      initialAverageTicket,
    };

    setProjectsCount(initialProjectsCount);
    setProposalsCount(initialProposalsCount);
    setValorProjetos(initialPipelineValue);
    setValorMedio(initialAverageTicket);

    if (isOwner && changed) {
      setIsUpdating(true);
      const t = setTimeout(() => setIsUpdating(false), 900);
      return () => clearTimeout(t);
    }
  }, [
    initialProjectsCount,
    initialProposalsCount,
    initialPipelineValue,
    initialAverageTicket,
    isOwner,
  ]);

  const statusConfig = getStatusConfig(projectsCount);

  const subcards = [
    {
      title: 'Projetos Criados',
      value: projectsCount.toString(),
      suffix: projectsCount === 1 ? 'projeto' : 'projetos',
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Propostas Geradas',
      value: proposalsCount.toString(),
      suffix: proposalsCount === 1 ? 'proposta' : 'propostas',
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Valor Médio por Projeto',
      value: `R$ ${valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      suffix: '',
      icon: Wallet,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <PremiumFrame title="📊 Status da Operação" className="fade-in">
      {/* Status Principal */}
      <div 
        className={`p-4 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor} mb-4 transition-all duration-500 ${isUpdating ? 'ring-1 ring-primary/30' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{statusConfig.icon}</span>
            <div>
              <span className={`text-sm font-semibold ${statusConfig.color} transition-all duration-300`}>
                {statusConfig.status}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Valor em Projetos Ativos:</span>
              </div>
              <p 
                className={`text-xl font-bold text-foreground mt-1 transition-all duration-500 ${isUpdating ? 'text-primary' : ''}`}
              >
                R$ {valorProjetos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subcards */}
      <div className="grid grid-cols-3 gap-3">
        {subcards.map((subcard, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg bg-primary/5 border border-primary/10 text-center transition-all duration-300 ${isUpdating ? 'bg-primary/8' : ''}`}
          >
            <div className={`inline-flex p-2 rounded-lg ${subcard.bgColor} mb-2`}>
              <subcard.icon className={`h-4 w-4 ${subcard.color}`} strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{subcard.title}</p>
            <p className="text-lg font-semibold text-foreground mt-1 transition-all duration-300">
              {subcard.value}
            </p>
            {subcard.suffix && (
              <p className="text-xs text-muted-foreground/70">{subcard.suffix}</p>
            )}
          </div>
        ))}
      </div>
    </PremiumFrame>
  );
}
