import { Card } from '@/components/ui/card';
import { ModuloConfig } from '@/types/matriz';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  modulo: ModuloConfig;
  practicasCount: number;
  onClick: () => void;
  className?: string;
}

export const ModuleCard = ({ modulo, practicasCount, onClick, className }: ModuleCardProps) => {
  const colorClasses = {
    cuerpo: 'bg-cuerpo hover:bg-cuerpo/90 text-cuerpo-foreground',
    mente: 'bg-mente hover:bg-mente/90 text-mente-foreground',
    espiritu: 'bg-espiritu hover:bg-espiritu/90 text-espiritu-foreground',
    sombra: 'bg-sombra hover:bg-sombra/90 text-sombra-foreground',
    etica: 'bg-etica hover:bg-etica/90 text-etica-foreground',
    sexualidad: 'bg-sexualidad hover:bg-sexualidad/90 text-sexualidad-foreground',
    trabajo: 'bg-trabajo hover:bg-trabajo/90 text-trabajo-foreground',
    emociones: 'bg-emociones hover:bg-emociones/90 text-emociones-foreground',
    relaciones: 'bg-relaciones hover:bg-relaciones/90 text-relaciones-foreground',
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl',
        'p-6 min-h-[160px] flex flex-col items-center justify-center text-center',
        'border-2 border-transparent hover:border-white/20',
        colorClasses[modulo.color as keyof typeof colorClasses],
        className
      )}
      onClick={onClick}
    >
      <div className="text-4xl mb-3">{modulo.icono}</div>
      <h3 className="text-xl font-bold mb-2">{modulo.nombre}</h3>
      <p className="text-sm opacity-90">
        {practicasCount} {practicasCount === 1 ? 'práctica' : 'prácticas'}
      </p>
      {modulo.esPrincipal && (
        <div className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
          Principal
        </div>
      )}
    </Card>
  );
};