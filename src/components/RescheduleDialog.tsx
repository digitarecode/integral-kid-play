import React, { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { AgendaItem, Practica } from '@/types/matriz';
import { diasSemana, franjasHorarias } from '@/data/matrizData';
import { AgendaTimeFields } from '@/components/AgendaTimeFields';
import { MINUTOS_ANTES_DEFECTO } from '@/lib/agenda';
import { Copy, Trash2 } from 'lucide-react';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practica: Practica | null;
  item: AgendaItem | null;
  currentDia: string;
  currentFranja: string;
  onSaveItem: (itemId: string, cambios: { hora: string | null; recordatorio: boolean; minutosAntes: number }) => void;
  onReschedule: (itemId: string, dia: string, franja: string) => void;
  onCopyToDays: (itemId: string, dias: string[]) => void;
  onDeleteItem: (itemId: string) => void;
}

const diasLabels: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const franjasLabels: Record<string, string> = {
  mañana: '🌅 Mañana',
  'media-mañana': '☀️ Media Mañana',
  tarde: '🌞 Tarde',
  noche: '🌙 Noche',
};

export const RescheduleDialog = ({
  open,
  onOpenChange,
  practica,
  item,
  currentDia,
  currentFranja,
  onSaveItem,
  onReschedule,
  onCopyToDays,
  onDeleteItem,
}: RescheduleDialogProps) => {
  const [selectedDia, setSelectedDia] = useState(currentDia);
  const [selectedFranja, setSelectedFranja] = useState(currentFranja);
  const [hora, setHora] = useState('');
  const [recordatorio, setRecordatorio] = useState(false);
  const [minutosAntes, setMinutosAntes] = useState(MINUTOS_ANTES_DEFECTO);
  const [diasCopia, setDiasCopia] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedDia(currentDia);
    setSelectedFranja(currentFranja);
    setHora(item?.hora ?? '');
    setRecordatorio(item?.recordatorio ?? false);
    setMinutosAntes(item?.minutosAntes ?? MINUTOS_ANTES_DEFECTO);
    setDiasCopia([]);
  }, [open, currentDia, currentFranja, item]);

  if (!practica || !item) return null;

  const toggleDiaCopia = (dia: string) => {
    setDiasCopia(prev => (prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]));
  };

  const guardar = () => {
    onSaveItem(item.id, { hora: hora || null, recordatorio: recordatorio && !!hora, minutosAntes });
    if (selectedDia !== currentDia || selectedFranja !== currentFranja) {
      onReschedule(item.id, selectedDia, selectedFranja);
    }
    if (diasCopia.length > 0) {
      onCopyToDays(item.id, diasCopia);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Editar esta actividad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              {practica.icono} {practica.titulo}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Ahora está en {diasLabels[currentDia]} · {franjasLabels[currentFranja]}
              {item.hora ? ` · ${item.hora}` : ''}
            </p>
          </div>

          <AgendaTimeFields
            idPrefijo="editar"
            hora={hora}
            onHoraChange={valor => {
              setHora(valor);
              if (!valor) setRecordatorio(false);
            }}
            recordatorio={recordatorio}
            onRecordatorioChange={setRecordatorio}
            minutosAntes={minutosAntes}
            onMinutosAntesChange={setMinutosAntes}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Día</Label>
              <Select value={selectedDia} onValueChange={setSelectedDia}>
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map(dia => (
                    <SelectItem key={dia} value={dia}>
                      {diasLabels[dia]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Momento del día</Label>
              <Select value={selectedFranja} onValueChange={setSelectedFranja}>
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {franjasHorarias.map(franja => (
                    <SelectItem key={franja} value={franja}>
                      {franjasLabels[franja]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-accent/50 p-3">
            <Label className="text-sm flex items-center gap-2 mb-2">
              <Copy className="h-4 w-4" /> Copiar a otros días
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Se copia con la misma hora y el mismo aviso, en el mismo momento del día.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {diasSemana
                .filter(dia => dia !== currentDia)
                .map(dia => (
                  <div key={dia} className="flex items-center space-x-2">
                    <Checkbox
                      id={`copia-${dia}`}
                      checked={diasCopia.includes(dia)}
                      onCheckedChange={() => toggleDiaCopia(dia)}
                    />
                    <Label htmlFor={`copia-${dia}`} className="text-xs sm:text-sm font-normal cursor-pointer">
                      {diasLabels[dia]}
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              onDeleteItem(item.id);
              onOpenChange(false);
            }}
            className="w-full min-h-[44px] text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Quitar de la agenda
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto min-h-[44px]">
            Cancelar
          </Button>
          <Button onClick={guardar} className="w-full sm:w-auto min-h-[44px]">
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
