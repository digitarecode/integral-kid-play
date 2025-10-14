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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practica: Practica | null;
  onAddToSchedule: (practicaId: string, dia: string, franja: string) => void;
  onAddToMultipleSchedules?: (practicaId: string, dias: string[], franjas: string[]) => void;
}

export const ScheduleDialog = ({ open, onOpenChange, practica, onAddToSchedule, onAddToMultipleSchedules }: ScheduleDialogProps) => {
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedFranja, setSelectedFranja] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'single' | 'multiple'>('single');
  const [selectedDias, setSelectedDias] = useState<string[]>([]);
  const [selectedFranjas, setSelectedFranjas] = useState<string[]>([]);
  const [multiDayPreset, setMultiDayPreset] = useState<string>('custom');

  const handleAdd = () => {
    if (!practica) return;

    if (scheduleMode === 'single' && selectedDia && selectedFranja) {
      onAddToSchedule(practica.id, selectedDia, selectedFranja);
      resetAndClose();
    } else if (scheduleMode === 'multiple' && selectedDias.length > 0 && selectedFranjas.length > 0) {
      if (onAddToMultipleSchedules) {
        onAddToMultipleSchedules(practica.id, selectedDias, selectedFranjas);
      } else {
        // Fallback: add individually
        selectedDias.forEach(dia => {
          selectedFranjas.forEach(franja => {
            onAddToSchedule(practica.id, dia, franja);
          });
        });
      }
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setSelectedDia('');
    setSelectedFranja('');
    setSelectedDias([]);
    setSelectedFranjas([]);
    setScheduleMode('single');
    setMultiDayPreset('custom');
  };

  const handlePresetChange = (preset: string) => {
    setMultiDayPreset(preset);
    switch (preset) {
      case 'everyday-same':
        setSelectedDias(diasSemana);
        setSelectedFranjas([]);
        break;
      case 'everyday-custom':
        setSelectedDias(diasSemana);
        setSelectedFranjas([]);
        break;
      case 'specific-same':
        setSelectedDias([]);
        setSelectedFranjas([]);
        break;
      case 'custom':
        setSelectedDias([]);
        setSelectedFranjas([]);
        break;
    }
  };

  const toggleDia = (dia: string) => {
    setSelectedDias(prev => 
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const toggleFranja = (franja: string) => {
    setSelectedFranjas(prev => 
      prev.includes(franja) ? prev.filter(f => f !== franja) : [...prev, franja]
    );
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
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Añadir al Horario</DialogTitle>
        </DialogHeader>
        
        {practica && (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                {practica.icono} {practica.titulo}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {practica.duracion} minutos • {practica.nivel}
              </p>
            </div>

            {/* Schedule Mode Selector */}
            <div>
              <Label className="text-sm">Modo de programación</Label>
              <RadioGroup value={scheduleMode} onValueChange={(v: 'single' | 'multiple') => setScheduleMode(v)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer text-sm">
                    Un día y horario
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id="multiple" />
                  <Label htmlFor="multiple" className="font-normal cursor-pointer text-sm">
                    Múltiples días u horarios
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {scheduleMode === 'single' ? (
              <>
                <div>
                  <Label htmlFor="dia" className="text-sm">Día de la semana</Label>
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
                  <Label htmlFor="franja" className="text-sm">Momento del día</Label>
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
              </>
            ) : (
              <>
                {/* Presets */}
                <div>
                  <Label className="text-sm">Plantillas rápidas</Label>
                  <Select value={multiDayPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyday-same">Todos los días (mismo horario)</SelectItem>
                      <SelectItem value="everyday-custom">Todos los días (horarios variados)</SelectItem>
                      <SelectItem value="specific-same">Días específicos (mismo horario)</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Days selector */}
                <div>
                  <Label className="text-sm mb-2 block">Días de la semana</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {diasSemana.map(dia => (
                      <div key={dia} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dia-${dia}`}
                          checked={selectedDias.includes(dia)}
                          onCheckedChange={() => toggleDia(dia)}
                        />
                        <Label
                          htmlFor={`dia-${dia}`}
                          className="text-xs sm:text-sm font-normal cursor-pointer"
                        >
                          {diasLabels[dia as keyof typeof diasLabels]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time slots selector */}
                <div>
                  <Label className="text-sm mb-2 block">Momentos del día</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {franjasHorarias.map(franja => (
                      <div key={franja} className="flex items-center space-x-2">
                        <Checkbox
                          id={`franja-${franja}`}
                          checked={selectedFranjas.includes(franja)}
                          onCheckedChange={() => toggleFranja(franja)}
                        />
                        <Label
                          htmlFor={`franja-${franja}`}
                          className="text-xs sm:text-sm font-normal cursor-pointer"
                        >
                          {franjasLabels[franja as keyof typeof franjasLabels]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDias.length > 0 && selectedFranjas.length > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                    <p className="font-medium mb-1">Se añadirá a:</p>
                    <p className="text-muted-foreground">
                      {selectedDias.length} día{selectedDias.length !== 1 ? 's' : ''} × {selectedFranjas.length} horario{selectedFranjas.length !== 1 ? 's' : ''} = {selectedDias.length * selectedFranjas.length} entrada{selectedDias.length * selectedFranjas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetAndClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={
              scheduleMode === 'single' 
                ? !selectedDia || !selectedFranja
                : selectedDias.length === 0 || selectedFranjas.length === 0
            }
            className="w-full sm:w-auto"
          >
            Añadir al Horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};