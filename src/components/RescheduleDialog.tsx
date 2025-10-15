import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Practica } from '@/types/matriz';
import { diasSemana, franjasHorarias } from '@/data/matrizData';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practica: Practica | null;
  currentDia: string;
  currentFranja: string;
  currentHorarioId: string;
  onReschedule: (horarioId: string, practicaId: string, newDia: string, newFranja: string) => void;
}

export const RescheduleDialog = ({ 
  open, 
  onOpenChange, 
  practica, 
  currentDia, 
  currentFranja, 
  currentHorarioId,
  onReschedule 
}: RescheduleDialogProps) => {
  const [selectedDia, setSelectedDia] = useState(currentDia);
  const [selectedFranja, setSelectedFranja] = useState(currentFranja);

  const handleReschedule = () => {
    if (!practica || !selectedDia || !selectedFranja) return;
    
    onReschedule(currentHorarioId, practica.id, selectedDia, selectedFranja);
    onOpenChange(false);
  };

  const franjasLabels = {
    mañana: '🌅 Mañana',
    'media-mañana': '☀️ Media Mañana',  
    tarde: '🌞 Tarde',
    noche: '🌙 Noche'
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

  React.useEffect(() => {
    if (open) {
      setSelectedDia(currentDia);
      setSelectedFranja(currentFranja);
    }
  }, [open, currentDia, currentFranja]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Reprogramar práctica</DialogTitle>
        </DialogHeader>
        
        {practica && (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                {practica.icono} {practica.titulo}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Actualmente: {diasLabels[currentDia as keyof typeof diasLabels]} - {franjasLabels[currentFranja as keyof typeof franjasLabels]}
              </p>
            </div>

            <div>
              <Label htmlFor="new-dia" className="text-sm">Nuevo día</Label>
              <Select value={selectedDia} onValueChange={setSelectedDia}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un día..." />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map(dia => (
                    <SelectItem key={dia} value={dia}>
                      {diasLabels[dia as keyof typeof diasLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="new-franja" className="text-sm">Nuevo horario</Label>
              <Select value={selectedFranja} onValueChange={setSelectedFranja}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un momento..." />
                </SelectTrigger>
                <SelectContent>
                  {franjasHorarias.map(franja => (
                    <SelectItem key={franja} value={franja}>
                      {franjasLabels[franja as keyof typeof franjasLabels]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleReschedule}
            disabled={!selectedDia || !selectedFranja || (selectedDia === currentDia && selectedFranja === currentFranja)}
            className="w-full sm:w-auto"
          >
            Reprogramar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
