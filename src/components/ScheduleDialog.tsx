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

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practica: Practica | null;
  onAddToSchedule: (practicaId: string, dia: string, franja: string) => void;
}

export const ScheduleDialog = ({ open, onOpenChange, practica, onAddToSchedule }: ScheduleDialogProps) => {
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedFranja, setSelectedFranja] = useState('');

  const handleAdd = () => {
    if (practica && selectedDia && selectedFranja) {
      onAddToSchedule(practica.id, selectedDia, selectedFranja);
      onOpenChange(false);
      setSelectedDia('');
      setSelectedFranja('');
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir al Horario</DialogTitle>
        </DialogHeader>
        
        {practica && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                {practica.icono} {practica.titulo}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {practica.duracion} minutos • {practica.nivel}
              </p>
            </div>
            
            <div>
              <Label htmlFor="dia">Día de la semana</Label>
              <Select value={selectedDia} onValueChange={setSelectedDia}>
                <SelectTrigger>
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
              <Label htmlFor="franja">Momento del día</Label>
              <Select value={selectedFranja} onValueChange={setSelectedFranja}>
                <SelectTrigger>
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={!selectedDia || !selectedFranja}
          >
            Añadir al Horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};