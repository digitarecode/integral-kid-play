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
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {practica.icono && <span className="text-xl">{practica.icono}</span>}
          <h4 className="font-semibold text-lg">{practica.titulo}</h4>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{practica.descripcion}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={nivelColors[practica.nivel]}>
            {nivelTexts[practica.nivel]}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {practica.duracion} min
          </div>
        </div>
        
        {onAddToSchedule && (
          <Button size="sm" variant="outline" onClick={onAddToSchedule}>
            Añadir al horario
          </Button>
        )}
      </div>
    </Card>
  );
};