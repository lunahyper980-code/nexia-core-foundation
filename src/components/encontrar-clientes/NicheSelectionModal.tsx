import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Scissors, 
  Heart, 
  Stethoscope, 
  UtensilsCrossed, 
  Dumbbell, 
  Home, 
  Scale, 
  Calculator, 
  Store, 
  Wrench,
  TrendingUp,
  Flame
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NicheOption {
  label: string;
  icon: LucideIcon;
  conversionChance: 'alta' | 'média' | 'baixa';
  highlight?: boolean;
}

const NICHES: NicheOption[] = [
  { label: 'Barbearia', icon: Scissors, conversionChance: 'alta', highlight: true },
  { label: 'Salão de beleza', icon: Heart, conversionChance: 'alta', highlight: true },
  { label: 'Clínica / Consultório', icon: Stethoscope, conversionChance: 'alta', highlight: true },
  { label: 'Restaurante / Delivery', icon: UtensilsCrossed, conversionChance: 'média' },
  { label: 'Academia / Personal', icon: Dumbbell, conversionChance: 'média' },
  { label: 'Imobiliária', icon: Home, conversionChance: 'alta', highlight: true },
  { label: 'Advogado', icon: Scale, conversionChance: 'média' },
  { label: 'Contador', icon: Calculator, conversionChance: 'média' },
  { label: 'Loja local', icon: Store, conversionChance: 'alta', highlight: true },
  { label: 'Prestador de serviços', icon: Wrench, conversionChance: 'média' },
];

const conversionBadge = {
  alta: { 
    label: 'Alta conversão', 
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: TrendingUp
  },
  média: { 
    label: 'Boa demanda', 
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Flame
  },
  baixa: { 
    label: 'Nicho específico', 
    className: 'bg-muted text-muted-foreground border-border/30',
    icon: null
  },
};

interface NicheSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNiche: string;
  onSelectNiche: (niche: string) => void;
}

export function NicheSelectionModal({ 
  open, 
  onOpenChange, 
  selectedNiche, 
  onSelectNiche 
}: NicheSelectionModalProps) {
  const handleSelect = (label: string) => {
    onSelectNiche(label);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Escolher Nicho
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um nicho para prospectar leads qualificados
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {NICHES.map(({ label, icon: Icon, conversionChance, highlight }) => {
            const isSelected = selectedNiche === label;
            const badge = conversionBadge[conversionChance];
            const BadgeIcon = badge.icon;

            return (
              <button
                key={label}
                type="button"
                onClick={() => handleSelect(label)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                  "border backdrop-blur-sm group relative overflow-hidden",
                  isSelected
                    ? "bg-primary/15 border-primary/40 shadow-sm shadow-primary/10"
                    : highlight
                    ? "bg-background/60 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    : "bg-background/40 border-border/30 hover:border-border/50 hover:bg-background/60"
                )}
              >
                {/* Highlight glow effect */}
                {highlight && !isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <div className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  isSelected 
                    ? "bg-primary/20" 
                    : highlight 
                    ? "bg-primary/10 group-hover:bg-primary/15" 
                    : "bg-muted/50"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isSelected ? "text-primary" : highlight ? "text-primary/80" : "text-muted-foreground"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block text-sm font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {label}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full border",
                    badge.className
                  )}>
                    {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5" />}
                    {badge.label}
                  </span>
                </div>

                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
          💡 Nichos com "Alta conversão" têm maior taxa de fechamento de sites e apps
        </p>
      </DialogContent>
    </Dialog>
  );
}