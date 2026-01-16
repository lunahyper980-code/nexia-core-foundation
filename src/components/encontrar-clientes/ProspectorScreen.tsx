import { Globe, Zap, Sparkles } from 'lucide-react';
import { PremiumGlobe } from './PremiumGlobe';
import { ProspectorSearchForm } from './ProspectorSearchForm';

interface ProspectorScreenProps {
  nicho: string;
  cidade: string;
  possuiSite: boolean;
  possuiInstagram: boolean;
  isSearching: boolean;
  onNichoChange: (value: string) => void;
  onCidadeChange: (value: string) => void;
  onPossuiSiteChange: (value: boolean) => void;
  onPossuiInstagramChange: (value: boolean) => void;
  onSearch: () => void;
}

export function ProspectorScreen({
  nicho,
  cidade,
  possuiSite,
  possuiInstagram,
  isSearching,
  onNichoChange,
  onCidadeChange,
  onPossuiSiteChange,
  onPossuiInstagramChange,
  onSearch,
}: ProspectorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[100px]" />
      </div>

      {/* Content container */}
      <div className="relative min-h-screen flex flex-col items-center px-4 py-6 sm:py-8">
        {/* Badges header */}
        {!isSearching && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm text-xs sm:text-sm">
              <Globe className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-white/90 font-medium">Alcance Mundial</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs sm:text-sm">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-white/90 font-medium">IA Avançada</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-white/90 font-medium">Powered by Nexia</span>
            </div>
          </div>
        )}

        {/* Title section - hidden when searching */}
        {!isSearching && (
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Prospectar Leads
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
            </p>
          </div>
        )}

        {/* Globe - central element */}
        <div className="flex-1 flex items-center justify-center w-full">
          <PremiumGlobe isSearching={isSearching} />
        </div>

        {/* Search form - hidden when searching */}
        {!isSearching && (
          <div className="w-full animate-fade-in">
            <ProspectorSearchForm
              nicho={nicho}
              cidade={cidade}
              possuiSite={possuiSite}
              possuiInstagram={possuiInstagram}
              isSearching={isSearching}
              onNichoChange={onNichoChange}
              onCidadeChange={onCidadeChange}
              onPossuiSiteChange={onPossuiSiteChange}
              onPossuiInstagramChange={onPossuiInstagramChange}
              onSearch={onSearch}
            />

            {/* Bottom tagline */}
            <p className="text-center text-xs text-white/30 mt-6 mb-4">
              Prospecção inteligente com a tecnologia Nexia
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
