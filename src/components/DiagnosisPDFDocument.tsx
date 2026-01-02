import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiagnosisPDFDocumentProps {
  diagnosis: {
    company_name: string;
    city_state?: string | null;
    segment?: string | null;
    created_at: string;
    diagnosis_text?: string | null;
  };
  onClose: () => void;
}

interface DiagnosisSections {
  visao_geral?: string;
  pontos_atencao?: string;
  oportunidades?: string;
  recomendacoes?: string;
  proximo_passo?: string;
}

const sectionTitles: Record<string, string> = {
  visao_geral: 'Visão Geral',
  pontos_atencao: 'Pontos de Atenção',
  oportunidades: 'Oportunidades Identificadas',
  recomendacoes: 'Recomendações',
  proximo_passo: 'Próximo Passo'
};

const sectionOrder = ['visao_geral', 'pontos_atencao', 'oportunidades', 'recomendacoes', 'proximo_passo'];

export function DiagnosisPDFDocument({ diagnosis, onClose }: DiagnosisPDFDocumentProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Parse sections from diagnosis text
  const parseSections = (): DiagnosisSections => {
    if (!diagnosis.diagnosis_text) return {};
    
    try {
      // Remove code block markers if present
      let cleanText = diagnosis.diagnosis_text;
      cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch {
      return { visao_geral: diagnosis.diagnosis_text };
    }
  };

  const sections = parseSections();

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto">
      {/* Header - Hide on print */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Versão para PDF</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              disabled={isPrinting}
              className="gap-2"
            >
              {isPrinting ? (
                <>Preparando...</>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        <div className="bg-card print:bg-white rounded-lg print:rounded-none shadow-lg print:shadow-none p-8 print:p-12 space-y-8">
          
          {/* Document Header */}
          <div className="border-b pb-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground print:text-black">
                  Diagnóstico Digital
                </h1>
                <p className="text-muted-foreground print:text-gray-600 mt-1">
                  Análise Profissional de Presença Digital
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground print:text-gray-600">
                <p>{format(new Date(diagnosis.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            
            <div className="bg-muted/50 print:bg-gray-100 rounded-lg p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium text-foreground print:text-black min-w-32">Empresa:</span>
                  <span className="text-muted-foreground print:text-gray-700">{diagnosis.company_name}</span>
                </div>
                {diagnosis.city_state && (
                  <div className="flex gap-2">
                    <span className="font-medium text-foreground print:text-black min-w-32">Localização:</span>
                    <span className="text-muted-foreground print:text-gray-700">{diagnosis.city_state}</span>
                  </div>
                )}
                {diagnosis.segment && (
                  <div className="flex gap-2">
                    <span className="font-medium text-foreground print:text-black min-w-32">Segmento:</span>
                    <span className="text-muted-foreground print:text-gray-700">{diagnosis.segment}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {sectionOrder.map((key) => {
              const content = sections[key as keyof DiagnosisSections];
              if (!content) return null;
              
              return (
                <section key={key} className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground print:text-black border-l-4 border-primary pl-3">
                    {sectionTitles[key]}
                  </h2>
                  <div className="text-muted-foreground print:text-gray-700 leading-relaxed pl-4 whitespace-pre-wrap">
                    {content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <p className="text-xs text-muted-foreground print:text-gray-500 text-center">
              Documento gerado automaticamente • {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: static !important;
          }
          .bg-background\\/95 {
            background: white !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          .p-8 {
            padding: 0 !important;
          }
          .bg-card {
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
