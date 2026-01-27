import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'h-8 w-8 rounded-full transition-all duration-300',
        'hover:bg-secondary/80',
        className
      )}
      title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
