import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgendaItem, HorarioEntry, Practica } from '@/types/matriz';
import { diasSemana, franjasHorarias } from '@/data/matrizData';
import { MAX_ITEMS_POR_CELDA, ordenarItems } from '@/lib/agenda';
import { X, ChevronUp, ChevronDown, Bell, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyScheduleProps {
  horarios: HorarioEntry[];
  practicas: Practica[];
  onRemoveItem: (itemId: string) => void;
  onMoveItem?: (itemId: string, direction: 'up' | 'down') => void;
  onQuickAdd?: (dia: string, franja: string) => void;
  onEditItem?: (practica: Practica, item: AgendaItem, dia: string, franja: string) => void;
}

const moduloClases: Record<string, string> = {
  cuerpo: 'bg-blue-50 border-blue-200 text-blue-900',
  mente: 'bg-green-50 border-green-200 text-green-900',
  espiritu: 'bg-purple-50 border-purple-200 text-purple-900',
  sombra: 'bg-gray-50 border-gray-200 text-gray-900',
  etica: 'bg-pink-50 border-pink-200 text-pink-900',
  sexualidad: 'bg-rose-50 border-rose-200 text-rose-900',
  trabajo: 'bg-orange-50 border-orange-200 text-orange-900',
  emociones: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  relaciones: 'bg-cyan-50 border-cyan-200 text-cyan-900',
};

export const WeeklySchedule = ({
  horarios,
  practicas,
  onRemoveItem,
  onMoveItem,
  onQuickAdd,
  onEditItem,
}: WeeklyScheduleProps) => {
  const getPracticaById = (id: string) => practicas.find(p => p.id === id);

  const getHorarioForDayAndFranja = (dia: string, franja: string) =>
    horarios.find(h => h.dia === dia && h.franja === franja);

  const itemsDe = (horario?: HorarioEntry) =>
    horario
      ? ordenarItems(horario.items)
          .map(item => ({ item, practica: getPracticaById(item.practicaId) }))
          .filter((par): par is { item: AgendaItem; practica: Practica } => !!par.practica)
      : [];

  const dayAccents: Record<string, string> = {
    lunes: 'bg-day-lunes',
    martes: 'bg-day-martes',
    miercoles: 'bg-day-miercoles',
    jueves: 'bg-day-jueves',
    viernes: 'bg-day-viernes',
    sabado: 'bg-day-sabado',
    domingo: 'bg-day-domingo',
  };

  const franjasLabels = {
    mañana: '🌅 Mañana',
    'media-mañana': '☀️ Media Mañana',
    tarde: '🌞 Tarde',
    noche: '🌙 Noche',
  };

  const timeBlockStyles = {
    mañana: { bg: 'bg-orange-50', border: 'border-orange-300', header: 'bg-orange-100 text-orange-900 border-orange-300' },
    'media-mañana': { bg: 'bg-yellow-50', border: 'border-yellow-300', header: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    tarde: { bg: 'bg-amber-50', border: 'border-amber-300', header: 'bg-amber-100 text-amber-900 border-amber-300' },
    noche: { bg: 'bg-indigo-50', border: 'border-indigo-300', header: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  };

  const diasLabels = {
    lunes: 'Lun',
    martes: 'Mar',
    miercoles: 'Mié',
    jueves: 'Jue',
    viernes: 'Vie',
    sabado: 'Sáb',
    domingo: 'Dom',
  };

  const MetaHora = ({ item, grande = false }: { item: AgendaItem; grande?: boolean }) => (
    <div className={cn('flex items-center gap-2 flex-wrap font-medium opacity-80', grande ? 'text-sm' : 'text-xs')}>
      {item.hora ? (
        <span className="inline-flex items-center gap-1">
          <Clock className={grande ? 'h-4 w-4' : 'h-3 w-3'} />
          {item.hora}
        </span>
      ) : (
        <span className="opacity-70">Sin hora fija</span>
      )}
      {item.recordatorio && item.hora && (
        <span className="inline-flex items-center gap-1">
          <Bell className={grande ? 'h-4 w-4' : 'h-3 w-3'} />
          {item.minutosAntes === 0 ? 'a la hora' : `-${item.minutosAntes} min`}
        </span>
      )}
    </div>
  );

  return (
    <div id="weekly-schedule" className="w-full space-y-4">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-center">Mi Agenda Semanal 📅</h2>

      {/* Vista Desktop/Tablet */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2">
              <div className="p-3"></div>

              {diasSemana.map(dia => (
                <div
                  key={dia}
                  className={cn('p-2 lg:p-3 text-center text-xs lg:text-sm font-semibold rounded-lg', dayAccents[dia])}
                >
                  {diasLabels[dia as keyof typeof diasLabels]}
                </div>
              ))}

              {franjasHorarias.map(franja => (
                <React.Fragment key={franja}>
                  <div
                    className={cn(
                      'p-2 lg:p-3 text-xs lg:text-sm font-bold rounded-lg flex items-center justify-center text-center border-2',
                      timeBlockStyles[franja as keyof typeof timeBlockStyles].header,
                    )}
                  >
                    <span className="hidden lg:inline">{franjasLabels[franja as keyof typeof franjasLabels]}</span>
                    <span className="lg:hidden text-center text-base">
                      {franja === 'mañana' ? '🌅' : franja === 'media-mañana' ? '☀️' : franja === 'tarde' ? '🌞' : '🌙'}
                    </span>
                  </div>

                  {diasSemana.map(dia => {
                    const horario = getHorarioForDayAndFranja(dia, franja);
                    const pares = itemsDe(horario);
                    const canAddMore = pares.length < MAX_ITEMS_POR_CELDA;

                    return (
                      <Card
                        key={`${dia}-${franja}`}
                        className={cn(
                          'p-1 lg:p-2 min-h-[100px] lg:min-h-[120px] relative border-2',
                          timeBlockStyles[franja as keyof typeof timeBlockStyles].bg,
                          timeBlockStyles[franja as keyof typeof timeBlockStyles].border,
                        )}
                      >
                        {pares.length > 0 ? (
                          <div className="space-y-1 lg:space-y-2 h-full">
                            {pares.map(({ item, practica }, index) => (
                              <div
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onEditItem?.(practica, item, dia, franja)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') onEditItem?.(practica, item, dia, franja);
                                }}
                                className={cn(
                                  'rounded-lg p-2 lg:p-3 text-xs relative group border-2 transition-all hover:shadow-sm cursor-pointer',
                                  moduloClases[practica.modulo],
                                )}
                              >
                                <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
                                  {index > 0 && onMoveItem && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      aria-label="Subir actividad"
                                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                      onClick={e => {
                                        e.stopPropagation();
                                        onMoveItem(item.id, 'up');
                                      }}
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {index < pares.length - 1 && onMoveItem && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      aria-label="Bajar actividad"
                                      className="h-5 w-5 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                      onClick={e => {
                                        e.stopPropagation();
                                        onMoveItem(item.id, 'down');
                                      }}
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Quitar actividad"
                                    className="h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    onClick={e => {
                                      e.stopPropagation();
                                      onRemoveItem(item.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="text-xs font-semibold mb-1 leading-tight">
                                  <span className="mr-1">{practica.icono}</span>
                                  <span className="break-words">{practica.titulo}</span>
                                </div>
                                <MetaHora item={item} />
                                <div className="text-xs opacity-70">{practica.duracion} min</div>
                              </div>
                            ))}
                            {canAddMore && (
                              <button
                                type="button"
                                onClick={() => onQuickAdd?.(dia, franja)}
                                className="w-full text-xs text-primary text-center font-medium mt-1 p-2 border-2 border-dashed border-primary/30 rounded hover:border-primary hover:bg-primary/5 transition-colors"
                              >
                                + Añadir otra ({MAX_ITEMS_POR_CELDA - pares.length} disponibles)
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onQuickAdd?.(dia, franja)}
                            className="h-full w-full min-h-[80px] flex items-center justify-center text-muted-foreground text-xs border-2 border-dashed border-muted rounded hover:border-primary hover:bg-accent/20 transition-colors"
                          >
                            <span className="text-xs">+ Añadir</span>
                          </button>
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
              <h3 className={cn('text-lg font-bold mb-3 text-center pb-2 rounded-md py-2', dayAccents[dia])}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </h3>
              <div className="space-y-3">
                {franjasHorarias.map(franja => {
                  const horario = getHorarioForDayAndFranja(dia, franja);
                  const pares = itemsDe(horario);
                  const canAddMore = pares.length < MAX_ITEMS_POR_CELDA;

                  return (
                    <div
                      key={`${dia}-${franja}`}
                      className={cn(
                        'border-2 rounded-xl p-3 mb-3',
                        timeBlockStyles[franja as keyof typeof timeBlockStyles].bg,
                        timeBlockStyles[franja as keyof typeof timeBlockStyles].border,
                      )}
                    >
                      <div
                        className={cn(
                          'text-base font-bold mb-3 p-2 rounded-lg text-center border-2',
                          timeBlockStyles[franja as keyof typeof timeBlockStyles].header,
                        )}
                      >
                        {franjasLabels[franja as keyof typeof franjasLabels]}
                      </div>

                      {pares.length > 0 ? (
                        <div className="space-y-2">
                          {pares.map(({ item, practica }) => (
                            <div
                              key={item.id}
                              className={cn(
                                'rounded-lg p-3 text-sm relative border-2 transition-all min-h-[64px] flex items-center',
                                moduloClases[practica.modulo],
                              )}
                            >
                              <button
                                type="button"
                                className="flex-1 text-left"
                                onClick={() => onEditItem?.(practica, item, dia, franja)}
                              >
                                <div className="font-semibold mb-1 leading-tight">
                                  <span className="mr-2 text-lg">{practica.icono}</span>
                                  <span className="break-words">{practica.titulo}</span>
                                </div>
                                <MetaHora item={item} grande />
                                <div className="text-sm opacity-70">{practica.duracion} minutos</div>
                              </button>

                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label="Quitar actividad"
                                className="h-11 w-11 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full ml-2 shrink-0"
                                onClick={() => onRemoveItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {canAddMore && (
                            <button
                              type="button"
                              onClick={() => onQuickAdd?.(dia, franja)}
                              className="w-full text-sm text-primary text-center font-medium p-3 border-2 border-dashed border-primary/30 rounded hover:border-primary hover:bg-primary/5 transition-colors min-h-[44px]"
                            >
                              + Añadir otra ({MAX_ITEMS_POR_CELDA - pares.length} disponibles)
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onQuickAdd?.(dia, franja)}
                          className="w-full text-center text-muted-foreground text-sm py-4 border-2 border-dashed border-muted rounded hover:border-primary hover:bg-accent/20 transition-colors min-h-[44px]"
                        >
                          <span className="text-sm">+ Añadir práctica</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-2">
          {diasSemana.map((dia, index) => (
            <div
              key={dia}
              className="h-1.5 w-8 rounded-full bg-muted"
              style={{ background: `hsl(var(--primary) / ${index === 0 ? '1' : '0.3'})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
