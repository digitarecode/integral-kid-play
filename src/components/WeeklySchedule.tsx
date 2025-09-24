import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HorarioEntry, Practica } from '@/types/matriz';
import { diasSemana, franjasHorarias, modulosConfig } from '@/data/matrizData';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyScheduleProps {
  horarios: HorarioEntry[];
  practicas: Practica[];
  onRemoveFromSchedule: (horarioId: string, practicaId?: string) => void;
  onMoveActivity?: (horarioId: string, practicaId: string, direction: 'up' | 'down') => void;
}

export const WeeklySchedule = ({ horarios, practicas, onRemoveFromSchedule, onMoveActivity }: WeeklyScheduleProps) => {
  const getPracticaById = (id: string) => practicas.find(p => p.id === id);
  
  const getModuloColor = (moduloId: string) => {
    const modulo = modulosConfig.find(m => m.id === moduloId);
    return modulo?.color || 'gray';
  };

  const getHorarioForDayAndFranja = (dia: string, franja: string) => {
    return horarios.find(h => h.dia === dia && h.franja === franja);
  };

  const franjasLabels = {
    mañana: '🌅 Mañana',
    'media-mañana': '☀️ Media Mañana',
    tarde: '🌞 Tarde',
    noche: '🌙 Noche'
  };

  const diasLabels = {
    lunes: 'Lun',
    martes: 'Mar',
    miercoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sabado: 'Sáb',
    domingo: 'Dom'
  };

  return (
    <div id="weekly-schedule" className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Mi Agenda Semanal 📅</h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2">
            {/* Header vacío */}
            <div className="p-3"></div>
            
            {/* Headers de días */}
            {diasSemana.map(dia => (
              <div key={dia} className="p-3 text-center font-semibold bg-muted rounded-lg">
                {diasLabels[dia as keyof typeof diasLabels]}
              </div>
            ))}
            
            {/* Filas por franja horaria */}
            {franjasHorarias.map(franja => (
              <React.Fragment key={franja}>
                {/* Label de franja */}
                <div className="p-3 text-sm font-medium bg-muted rounded-lg flex items-center justify-center text-center">
                  {franjasLabels[franja as keyof typeof franjasLabels]}
                </div>
                
                {/* Celdas para cada día */}
                {diasSemana.map(dia => {
                  const horario = getHorarioForDayAndFranja(dia, franja);
                  const practicasEnHorario = horario ? horario.practicaIds.map(id => getPracticaById(id)).filter(Boolean) as Practica[] : [];
                  
                  return (
                    <Card key={`${dia}-${franja}`} className="p-2 min-h-[100px] relative">
                      {practicasEnHorario.length > 0 ? (
                        <div className="space-y-1 h-full">
                          {practicasEnHorario.map((practica, index) => (
                            <div
                              key={`${practica.id}-${index}`}
                              className={cn(
                                'rounded p-2 text-xs relative group border',
                                `bg-${getModuloColor(practica.modulo)}-light border-${getModuloColor(practica.modulo)}/30`
                              )}
                            >
                              {/* Botones de control */}
                              <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {index > 0 && onMoveActivity && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                    onClick={() => onMoveActivity(horario!.id, practica.id, 'up')}
                                  >
                                    <ChevronUp className="h-2 w-2" />
                                  </Button>
                                )}
                                {index < practicasEnHorario.length - 1 && onMoveActivity && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                    onClick={() => onMoveActivity(horario!.id, practica.id, 'down')}
                                  >
                                    <ChevronDown className="h-2 w-2" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                  onClick={() => onRemoveFromSchedule(horario!.id, practica.id)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                              
                              <div className="text-xs font-medium mb-1 line-clamp-1">
                                {practica.icono} {practica.titulo}
                              </div>
                              <div className="text-xs opacity-75">
                                {practica.duracion} min
                              </div>
                            </div>
                          ))}
                          {practicasEnHorario.length < 3 && (
                            <div className="text-xs text-muted-foreground text-center opacity-50 mt-1">
                              +{3 - practicasEnHorario.length} más
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs border-2 border-dashed border-muted rounded">
                          Vacío
                        </div>
                      )}
                    </Card>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};