import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MINUTOS_ANTES_OPCIONES } from '@/lib/agenda';

interface AgendaTimeFieldsProps {
  hora: string;
  onHoraChange: (hora: string) => void;
  recordatorio: boolean;
  onRecordatorioChange: (valor: boolean) => void;
  minutosAntes: number;
  onMinutosAntesChange: (valor: number) => void;
  idPrefijo?: string;
}

/** Campos compartidos: hora exacta + aviso propio de una actividad programada. */
export const AgendaTimeFields = ({
  hora,
  onHoraChange,
  recordatorio,
  onRecordatorioChange,
  minutosAntes,
  onMinutosAntesChange,
  idPrefijo = 'agenda',
}: AgendaTimeFieldsProps) => (
  <div className="space-y-3 rounded-xl border-2 border-dashed border-primary/30 p-3">
    <div>
      <Label htmlFor={`${idPrefijo}-hora`} className="text-sm">
        Hora exacta (opcional) ⏰
      </Label>
      <Input
        id={`${idPrefijo}-hora`}
        type="time"
        value={hora}
        onChange={e => onHoraChange(e.target.value)}
        className="mt-1 min-h-[44px]"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Si no pones hora, la actividad se queda sólo en el momento del día.
      </p>
    </div>

    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={`${idPrefijo}-recordatorio`} className="text-sm font-normal cursor-pointer">
        Avisarme antes 🔔
      </Label>
      <Switch
        id={`${idPrefijo}-recordatorio`}
        checked={recordatorio}
        onCheckedChange={onRecordatorioChange}
        disabled={!hora}
      />
    </div>

    {recordatorio && hora && (
      <div>
        <Label className="text-sm">¿Cuánto antes?</Label>
        <Select value={String(minutosAntes)} onValueChange={v => onMinutosAntesChange(Number(v))}>
          <SelectTrigger className="mt-1 min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MINUTOS_ANTES_OPCIONES.map(m => (
              <SelectItem key={m} value={String(m)}>
                {m === 0 ? 'A la hora exacta' : `${m} minutos antes`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}

    {!hora && (
      <p className="text-xs text-muted-foreground">
        Para recibir un aviso, primero elige una hora exacta.
      </p>
    )}
  </div>
);
