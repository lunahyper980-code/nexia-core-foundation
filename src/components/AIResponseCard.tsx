import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Pencil, Save, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIResponseCardProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  onContentChange?: (newContent: string) => void;
  showCopy?: boolean;
  showEdit?: boolean;
  showUseInProposal?: boolean;
  onUseInProposal?: () => void;
  className?: string;
}

export function AIResponseCard({
  title,
  content,
  icon,
  onContentChange,
  showCopy = true,
  showEdit = true,
  showUseInProposal = false,
  onUseInProposal,
  className = '',
}: AIResponseCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onContentChange) {
      onContentChange(editedContent);
    }
    setIsEditing(false);
    toast({
      title: "Salvo!",
      description: "Alterações salvas com sucesso.",
    });
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <Card className={`transition-all ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex gap-1.5 flex-shrink-0">
            {showCopy && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            {showEdit && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-8 px-2 text-success hover:text-success"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {showUseInProposal && onUseInProposal && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUseInProposal}
                className="h-8 px-2 text-primary hover:text-primary"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[120px] resize-y"
          />
        ) : (
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for displaying multiple cards in a grid
interface AIResponseSection {
  id: string;
  title: string;
  content: string;
  icon?: React.ReactNode;
}

interface AIResponseGridProps {
  sections: AIResponseSection[];
  onSectionChange?: (id: string, newContent: string) => void;
  columns?: 1 | 2;
  showEdit?: boolean;
  showCopy?: boolean;
}

export function AIResponseGrid({
  sections,
  onSectionChange,
  columns = 1,
  showEdit = true,
  showCopy = true,
}: AIResponseGridProps) {
  return (
    <div className={`grid gap-4 ${columns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
      {sections.map((section) => (
        <AIResponseCard
          key={section.id}
          title={section.title}
          content={section.content}
          icon={section.icon}
          showCopy={showCopy}
          showEdit={showEdit}
          onContentChange={
            onSectionChange 
              ? (newContent) => onSectionChange(section.id, newContent)
              : undefined
          }
        />
      ))}
    </div>
  );
}

// Utility function to convert any value to clean text (no JSON visible)
function valueToText(value: unknown): string {
  if (typeof value === 'string') {
    return cleanMarkdown(value);
  }
  if (Array.isArray(value)) {
    return value.map(item => valueToText(item)).join('\n\n');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${formatTitle(k)}: ${valueToText(v)}`)
      .join('\n\n');
  }
  return String(value);
}

// Utility function to strip code block markers from AI responses
function stripCodeBlocks(text: string): string {
  return text
    // Remove ```json ... ``` blocks
    .replace(/^```(?:json)?\s*\n?/gi, '')
    .replace(/\n?```\s*$/gi, '')
    // Remove any remaining ``` markers
    .replace(/```/g, '')
    .trim();
}

// Utility function to parse AI response text into sections
export function parseAIResponse(text: string): AIResponseSection[] {
  // First, strip any code block markers
  const cleanedInput = stripCodeBlocks(text);
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(cleanedInput);
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: item.id || `section-${index}`,
        title: item.title || item.titulo || `Seção ${index + 1}`,
        content: valueToText(item.content || item.conteudo || item.texto || item),
      }));
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({
        id: key,
        title: formatTitle(key),
        content: valueToText(value),
      }));
    }
  } catch {
    // Not JSON, continue with text parsing
  }

  // Clean markdown from text
  const cleanedText = cleanMarkdown(cleanedInput);
  
  // Try to split by common section patterns
  const sectionPatterns = [
    /(?:^|\n)\*\*([^*]+)\*\*\n/g,
    /(?:^|\n)##?\s*([^\n]+)\n/g,
    /(?:^|\n)(\d+\.\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^:.\n]+)[:.]\s*\n/gi,
  ];

  for (const pattern of sectionPatterns) {
    const matches = [...cleanedInput.matchAll(pattern)];
    if (matches.length >= 2) {
      const sections: AIResponseSection[] = [];
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const title = cleanMarkdown(match[1]).trim();
        const startIndex = match.index! + match[0].length;
        const endIndex = matches[i + 1]?.index || cleanedInput.length;
        const content = cleanMarkdown(cleanedInput.substring(startIndex, endIndex)).trim();
        
        if (content) {
          sections.push({
            id: `section-${i}`,
            title,
            content,
          });
        }
      }
      if (sections.length >= 2) {
        return sections;
      }
    }
  }

  // Fallback: return as single section
  return [{
    id: 'main',
    title: 'Conteúdo',
    content: cleanedText,
  }];
}

function cleanMarkdown(text: string): string {
  return text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove bullet points at start of lines
    .replace(/^[\s]*[-•]\s+/gm, '')
    // Remove numbered lists with dots
    .replace(/^\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
}

function formatTitle(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
