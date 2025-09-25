import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Practica } from '@/types/matriz';
import { Edit, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticaCardProps {
  practica: Practica;
  onEdit: () => void;
  onDelete: () => void;
  onAddToSchedule?: () => void;
  className?: string;
}

export const PracticaCard = ({ practica, onEdit, onDelete, onAddToSchedule, className }: PracticaCardProps) => {
  const nivelColors = {
    facil: 'bg-green-100 text-green-800 border-green-200',
    intermedio: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    avanzado: 'bg-red-100 text-red-800 border-red-200'
  };

  const nivelTexts = {
    facil: 'Fácil',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
  };

  return (
    <Card className={cn('p-3 sm:p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {practica.icono && <span className="text-lg sm:text-xl flex-shrink-0">{practica.icono}</span>}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-lg leading-tight break-words">{practica.titulo}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{practica.descripcion}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onEdit}
            className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Badge className={`${nivelColors[practica.nivel]} text-xs`}>
            {nivelTexts[practica.nivel]}
          </Badge>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            {practica.duracion} min
          </div>
        </div>
        
        {onAddToSchedule && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onAddToSchedule}
            className="min-h-[44px] px-3 sm:px-4 w-full sm:w-auto text-xs sm:text-sm"
          >
            Añadir al horario
          </Button>
        )}
      </div>
    </Card>
  );
};