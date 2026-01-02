import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Target, ArrowLeft, Download, FileText, Calendar, MapPin, Users, CheckCircle2, Sparkles, Quote, Megaphone, Instagram, MousePointer, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIResponseCard } from '@/components/AIResponseCard';

const OBJECTIVES_LABELS: Record<string, string> = {
  attract: 'Atrair clientes',
  trust: 'Passar confiança',
  professionalize: 'Profissionalizar marca',
  organize: 'Organizar presença digital',
};

interface PositioningSections {
  posicionamento_central?: string;
  tom_comunicacao?: string;
  bio_instagram?: string;
  frase_autoridade?: string;
  cta_sugerido?: string;
  diretrizes_conteudo?: string;
}

export default function PosicionamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState<PositioningSections>({});

  const { data: positioning, isLoading } = useQuery({
    queryKey: ['positioning', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('digital_positionings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (positioning?.generated_positioning) {
      try {
        const parsed = JSON.parse(positioning.generated_positioning);
        setSections(parsed);
      } catch {
        // Fallback for old format - parse as text
        setSections({
          posicionamento_central: positioning.generated_positioning
        });
      }
    }
  }, [positioning]);

  const handleExportPDF = () => {
    const content = Object.entries(sections)
      .map(([key, value]) => `${formatSectionTitle(key)}\n\n${value}`)
      .join('\n\n---\n\n');

    const printContent = `
      <html>
        <head>
          <title>Posicionamento Digital - ${positioning?.company_name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 30px; }
            h2 { color: #4f46e5; margin-top: 35px; margin-bottom: 15px; font-size: 18px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Posicionamento Digital Profissional</h1>
          <div class="meta">
            <strong>${positioning?.company_name}</strong><br>
            ${positioning?.segment || ''} ${positioning?.city_state ? `• ${positioning.city_state}` : ''}<br>
            Gerado em ${positioning?.generated_at ? format(new Date(positioning.generated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
          </div>
          ${Object.entries(sections).map(([key, value]) => `
            <div class="section">
              <h2>${formatSectionTitle(key)}</h2>
              <p>${value}</p>
            </div>
          `).join('')}
          <div class="footer">
            Este documento foi gerado automaticamente como parte de um serviço profissional de posicionamento digital.
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF pronto para impressão!');
  };

  const handleUseInProposal = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleSectionChange = (key: string, newContent: string) => {
    setSections(prev => ({ ...prev, [key]: newContent }));
  };

  if (isLoading) {
    return (
      <AppLayout title="Posicionamento">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!positioning) {
    return (
      <AppLayout title="Posicionamento">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Posicionamento não encontrado</h2>
              <Button onClick={() => navigate('/solucoes/posicionamento')} className="mt-4">
                Voltar para posicionamentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const sectionIcons: Record<string, React.ReactNode> = {
    posicionamento_central: <Target className="h-4 w-4 text-primary" />,
    tom_comunicacao: <Megaphone className="h-4 w-4 text-orange-500" />,
    bio_instagram: <Instagram className="h-4 w-4 text-pink-500" />,
    frase_autoridade: <Quote className="h-4 w-4 text-purple-500" />,
    cta_sugerido: <MousePointer className="h-4 w-4 text-green-500" />,
    diretrizes_conteudo: <BookOpen className="h-4 w-4 text-blue-500" />,
  };

  return (
    <AppLayout title="Posicionamento Digital">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/posicionamento')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">{positioning.company_name}</h1>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Gerado em {positioning.generated_at 
                  ? format(new Date(positioning.generated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : 'Data não disponível'
                }
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {positioning.segment && (
                <div>
                  <span className="text-muted-foreground">Segmento</span>
                  <p className="font-medium">{positioning.segment}</p>
                </div>
              )}
              {positioning.city_state && (
                <div className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Localização</span>
                    <p className="font-medium">{positioning.city_state}</p>
                  </div>
                </div>
              )}
              {positioning.target_audience && (
                <div className="flex items-start gap-1">
                  <Users className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Público</span>
                    <p className="font-medium line-clamp-2">{positioning.target_audience}</p>
                  </div>
                </div>
              )}
              {positioning.positioning_objectives && positioning.positioning_objectives.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Objetivos</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(positioning.positioning_objectives as string[]).map((obj) => (
                      <Badge key={obj} variant="outline" className="text-xs">
                        {OBJECTIVES_LABELS[obj] || obj}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Content Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Posicionamento Gerado</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(sections).map(([key, value]) => (
              <AIResponseCard
                key={key}
                title={formatSectionTitle(key)}
                content={value || ''}
                icon={sectionIcons[key]}
                onContentChange={(newContent) => handleSectionChange(key, newContent)}
                className={key === 'posicionamento_central' || key === 'diretrizes_conteudo' ? 'md:col-span-2' : ''}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span>Este posicionamento pode ser entregue como serviço profissional ao cliente.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleUseInProposal} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Usar em proposta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function formatSectionTitle(key: string): string {
  const titles: Record<string, string> = {
    posicionamento_central: 'Posicionamento Central',
    tom_comunicacao: 'Tom de Comunicação',
    bio_instagram: 'Bio Profissional para Instagram',
    frase_autoridade: 'Frase de Autoridade',
    cta_sugerido: 'CTA Recomendado',
    diretrizes_conteudo: 'Diretrizes de Conteúdo',
  };
  return titles[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
