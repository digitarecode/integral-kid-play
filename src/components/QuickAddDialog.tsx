import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Practica } from '@/types/matriz';
import { modulosConfig } from '@/data/matrizData';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dia: string;
  franja: string;
  practicas: Practica[];
  onAddToSchedule: (practicaId: string, dia: string, franja: string) => void;
}

export const QuickAddDialog = ({
  open,
  onOpenChange,
  dia,
  franja,
  practicas,
  onAddToSchedule
}: QuickAddDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const filteredPracticas = practicas.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !selectedModule || p.modulo === selectedModule;
    return matchesSearch && matchesModule;
  });

  const handleAdd = (practicaId: string) => {
    onAddToSchedule(practicaId, dia, franja);
    onOpenChange(false);
    setSearchTerm('');
    setSelectedModule(null);
  };

  const diasLabels = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const franjasLabels = {
    mañana: '🌅 Mañana',
    'media-mañana': '☀️ Media Mañana',  
    tarde: '🌞 Tarde',
    noche: '🌙 Noche'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Añadir práctica a {diasLabels[dia as keyof typeof diasLabels]} - {franjasLabels[franja as keyof typeof franjasLabels]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prácticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Module filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedModule === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedModule(null)}
              className="min-h-[36px]"
            >
              Todos
            </Button>
            {modulosConfig.map(modulo => (
              <Button
                key={modulo.id}
                variant={selectedModule === modulo.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModule(modulo.id)}
                className="min-h-[36px]"
              >
                {modulo.icono} {modulo.nombre}
              </Button>
            ))}
          </div>

          {/* Practices list */}
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredPracticas.map(practica => {
                const modulo = modulosConfig.find(m => m.id === practica.modulo);
                return (
                  <div
                    key={practica.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg sm:text-xl">{practica.icono}</span>
                        <h4 className="font-semibold text-sm sm:text-base truncate">
                          {practica.titulo}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                        {practica.descripcion}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {modulo?.icono} {modulo?.nombre}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {practica.duracion} min
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {practica.nivel}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAdd(practica.id)}
                      className="min-h-[36px] shrink-0"
                    >
                      Añadir
                    </Button>
                  </div>
                );
              })}
              
              {filteredPracticas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No se encontraron prácticas</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
