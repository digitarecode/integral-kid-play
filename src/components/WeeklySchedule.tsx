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
  onQuickAdd?: (dia: string, franja: string) => void;
  onReschedule?: (practica: Practica, horarioId: string, dia: string, franja: string) => void;
}

export const WeeklySchedule = ({ horarios, practicas, onRemoveFromSchedule, onMoveActivity, onQuickAdd, onReschedule }: WeeklyScheduleProps) => {
  const getPracticaById = (id: string) => practicas.find(p => p.id === id);
  
  const getModuloColor = (moduloId: string) => {
    const modulo = modulosConfig.find(m => m.id === moduloId);
    return modulo?.color || 'gray';
  };

  const getHorarioForDayAndFranja = (dia: string, franja: string) => {
    return horarios.find(h => h.dia === dia && h.franja === franja);
  };

  // Day accent colors mapping
  const dayAccents: Record<string, string> = {
    'lunes': 'bg-day-lunes',
    'martes': 'bg-day-martes',
    'miercoles': 'bg-day-miercoles',
    'jueves': 'bg-day-jueves',
    'viernes': 'bg-day-viernes',
    'sabado': 'bg-day-sabado',
    'domingo': 'bg-day-domingo',
  };
  
  // Time slot accent colors mapping  
  const timeAccents: Record<string, string> = {
    'mañana': 'bg-time-manana',
    'media-mañana': 'bg-time-mediaManana',
    'tarde': 'bg-time-tarde',
    'noche': 'bg-time-noche',
  };

  const franjasLabels = {
    mañana: '🌅 Mañana',
    'media-mañana': '☀️ Media Mañana',
    tarde: '🌞 Tarde',
    noche: '🌙 Noche'
  };

  // Enhanced time block colors with stronger visual distinction
  const timeBlockStyles = {
    mañana: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      header: 'bg-orange-100 text-orange-900 border-orange-300'
    },
    'media-mañana': {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      header: 'bg-yellow-100 text-yellow-900 border-yellow-300'
    },
    tarde: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      header: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    noche: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-300',
      text: 'text-indigo-900',
      header: 'bg-indigo-100 text-indigo-900 border-indigo-300'
    }
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
    <div id="weekly-schedule" className="w-full space-y-4">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-center">
        Mi Agenda Semanal 📅
      </h2>
      
      {/* Vista Desktop/Tablet */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2">
              {/* Header vacío */}
              <div className="p-3"></div>
              
              {/* Headers de días */}
              {diasSemana.map(dia => (
                <div key={dia} className={cn(
                  "p-2 lg:p-3 text-center text-xs lg:text-sm font-semibold rounded-lg",
                  dayAccents[dia]
                )}>
                  {diasLabels[dia as keyof typeof diasLabels]}
                </div>
              ))}
              
              {/* Filas por franja horaria */}
              {franjasHorarias.map(franja => (
                <React.Fragment key={franja}>
                  {/* Label de franja */}
                  <div className={cn(
                    "p-2 lg:p-3 text-xs lg:text-sm font-bold rounded-lg flex items-center justify-center text-center border-2",
                    timeBlockStyles[franja as keyof typeof timeBlockStyles].header
                  )}>
                    <span className="hidden lg:inline">{franjasLabels[franja as keyof typeof franjasLabels]}</span>
                    <span className="lg:hidden text-center text-base">
                      {franja === 'mañana' ? '🌅' : 
                       franja === 'media-mañana' ? '☀️' : 
                       franja === 'tarde' ? '🌞' : '🌙'}
                    </span>
                  </div>
                  
                  {/* Celdas para cada día */}
                  {diasSemana.map(dia => {
                    const horario = getHorarioForDayAndFranja(dia, franja);
                    const practicasEnHorario = horario ? horario.practicaIds.map(id => getPracticaById(id)).filter(Boolean) as Practica[] : [];
                    const canAddMore = practicasEnHorario.length < 3;
                    
                    return (
                      <Card 
                        key={`${dia}-${franja}`} 
                        className={cn(
                          "p-1 lg:p-2 min-h-[100px] lg:min-h-[120px] relative border-2",
                          timeBlockStyles[franja as keyof typeof timeBlockStyles].bg,
                          timeBlockStyles[franja as keyof typeof timeBlockStyles].border,
                          canAddMore && "cursor-pointer hover:shadow-md transition-shadow"
                        )}
                        onClick={canAddMore ? () => onQuickAdd?.(dia, franja) : undefined}
                      >
                        {practicasEnHorario.length > 0 ? (
                          <div className="space-y-1 lg:space-y-2 h-full pointer-events-none">
                            {practicasEnHorario.map((practica, index) => (
                              <div
                                key={`${practica.id}-${index}`}
                                className={cn(
                                  'rounded-lg p-2 lg:p-3 text-xs relative group border-2 transition-all hover:shadow-sm pointer-events-auto',
                                  // Aplicar colores consistentes por módulo
                                  practica.modulo === 'cuerpo' && 'bg-blue-50 border-blue-200 text-blue-900',
                                  practica.modulo === 'mente' && 'bg-green-50 border-green-200 text-green-900',
                                  practica.modulo === 'espiritu' && 'bg-purple-50 border-purple-200 text-purple-900',
                                  practica.modulo === 'sombra' && 'bg-gray-50 border-gray-200 text-gray-900',
                                  practica.modulo === 'etica' && 'bg-pink-50 border-pink-200 text-pink-900',
                                  practica.modulo === 'sexualidad' && 'bg-rose-50 border-rose-200 text-rose-900',
                                  practica.modulo === 'trabajo' && 'bg-orange-50 border-orange-200 text-orange-900',
                                  practica.modulo === 'emociones' && 'bg-yellow-50 border-yellow-200 text-yellow-900',
                                  practica.modulo === 'relaciones' && 'bg-cyan-50 border-cyan-200 text-cyan-900'
                                )}
                              >
                                {/* Botones de control */}
                                <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  {index > 0 && onMoveActivity && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveActivity(horario!.id, practica.id, 'up');
                                      }}
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {index < practicasEnHorario.length - 1 && onMoveActivity && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveActivity(horario!.id, practica.id, 'down');
                                      }}
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveFromSchedule(horario!.id, practica.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {/* Contenido de la tarjeta - sin truncar texto */}
                                <div
                                  className="cursor-pointer hover:opacity-80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onReschedule?.(practica, horario!.id, dia, franja);
                                  }}
                                >
                                  <div className="text-xs font-semibold mb-1 leading-tight">
                                    <span className="mr-1">{practica.icono}</span>
                                    <span className="break-words">{practica.titulo}</span>
                                  </div>
                                  <div className="text-xs opacity-75 font-medium">
                                    {practica.duracion} min
                                  </div>
                                </div>
                              </div>
                            ))}
                            {canAddMore && (
                              <div className="text-xs text-primary text-center font-medium mt-1 p-2 border-2 border-dashed border-primary/30 rounded hover:border-primary hover:bg-primary/5 transition-colors pointer-events-auto">
                                + Añadir otra ({3 - practicasEnHorario.length} disponibles)
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-xs border-2 border-dashed border-muted rounded hover:border-primary hover:bg-accent/20 transition-colors">
                            <span className="text-xs">+ Añadir</span>
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

      {/* Vista Mobile - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-2 px-2 scroll-smooth">
          {diasSemana.map(dia => (
            <Card key={dia} className="flex-shrink-0 w-[85vw] snap-center p-4">
              <h3 className={cn(
                "text-lg font-bold mb-3 text-center sticky top-0 z-10 pb-2 rounded-md py-2",
                dayAccents[dia]
              )}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </h3>
            <div className="space-y-3">
              {franjasHorarias.map(franja => {
                const horario = getHorarioForDayAndFranja(dia, franja);
                const practicasEnHorario = horario ? horario.practicaIds.map(id => getPracticaById(id)).filter(Boolean) as Practica[] : [];
                const canAddMore = practicasEnHorario.length < 3;
                
                return (
                  <div 
                    key={`${dia}-${franja}`} 
                    className={cn(
                      "border-2 rounded-xl p-3 mb-3",
                      timeBlockStyles[franja as keyof typeof timeBlockStyles].bg,
                      timeBlockStyles[franja as keyof typeof timeBlockStyles].border,
                      canAddMore && "cursor-pointer hover:shadow-md transition-shadow"
                    )}
                    onClick={canAddMore ? () => onQuickAdd?.(dia, franja) : undefined}
                  >
                    <div className={cn(
                      "text-base font-bold mb-3 p-2 rounded-lg text-center border-2",
                      timeBlockStyles[franja as keyof typeof timeBlockStyles].header
                    )}>
                      {franjasLabels[franja as keyof typeof franjasLabels]}
                    </div>
                    
                    {practicasEnHorario.length > 0 ? (
                      <div className="space-y-2 pointer-events-none">
                        {practicasEnHorario.map((practica, index) => (
                          <div
                            key={`${practica.id}-${index}`}
                            className={cn(
                              'rounded-lg p-3 text-sm relative group border-2 transition-all pointer-events-auto',
                              // Touch-friendly sizing
                              'min-h-[60px] flex items-center',
                              // Aplicar colores consistentes por módulo
                              practica.modulo === 'cuerpo' && 'bg-blue-50 border-blue-200 text-blue-900',
                              practica.modulo === 'mente' && 'bg-green-50 border-green-200 text-green-900',
                              practica.modulo === 'espiritu' && 'bg-purple-50 border-purple-200 text-purple-900',
                              practica.modulo === 'sombra' && 'bg-gray-50 border-gray-200 text-gray-900',
                              practica.modulo === 'etica' && 'bg-pink-50 border-pink-200 text-pink-900',
                              practica.modulo === 'sexualidad' && 'bg-rose-50 border-rose-200 text-rose-900',
                              practica.modulo === 'trabajo' && 'bg-orange-50 border-orange-200 text-orange-900',
                              practica.modulo === 'emociones' && 'bg-yellow-50 border-yellow-200 text-yellow-900',
                              practica.modulo === 'relaciones' && 'bg-cyan-50 border-cyan-200 text-cyan-900'
                            )}
                           >
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReschedule?.(practica, horario!.id, dia, franja);
                              }}
                            >
                              <div className="font-semibold mb-1 leading-tight">
                                <span className="mr-2 text-lg">{practica.icono}</span>
                                <span className="break-words">{practica.titulo}</span>
                              </div>
                              <div className="text-sm opacity-75 font-medium">
                                {practica.duracion} minutos
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromSchedule(horario!.id, practica.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {canAddMore && (
                          <div className="text-sm text-primary text-center font-medium p-3 border-2 border-dashed border-primary/30 rounded hover:border-primary hover:bg-primary/5 transition-colors pointer-events-auto">
                            + Añadir otra ({3 - practicasEnHorario.length} disponibles)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-4 border-2 border-dashed border-muted rounded hover:border-primary hover:bg-accent/20 transition-colors">
                        <span className="text-sm">+ Añadir práctica</span>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </Card>
          ))}
        </div>
        
        {/* Indicador de scroll */}
        <div className="flex justify-center gap-2 mt-2">
          {diasSemana.map((dia, index) => (
            <div 
              key={dia} 
              className="h-1.5 w-8 rounded-full bg-muted"
              style={{
                background: `hsl(var(--primary) / ${index === 0 ? '1' : '0.3'})`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};