import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModuleCard } from '@/components/ModuleCard';
import { PracticaCard } from '@/components/PracticaCard';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { PracticaDialog } from '@/components/PracticaDialog';
import { ScheduleDialog, OpcionesHorario } from '@/components/ScheduleDialog';
import { QuickAddDialog } from '@/components/QuickAddDialog';
import { RescheduleDialog } from '@/components/RescheduleDialog';
import { useMatrizData } from '@/hooks/useMatrizData';
import { modulosConfig } from '@/data/matrizData';
import { AgendaItem, Practica } from '@/types/matriz';
import { totalItems } from '@/lib/agenda';
import { activarAvisos, avisosActivadosEnDispositivo, desactivarAvisos, soportaPush } from '@/lib/push';
import { MENSAJES } from '@/lib/mensajesRecordatorio';
import { Plus, Calendar, Download, Upload, RotateCcw, BookOpen, Star, Bell, BellOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    practicas,
    horarios,
    addPractica,
    updatePractica,
    deletePractica,
    addToSchedule,
    addToMultipleSchedules,
    updateAgendaItem,
    removeAgendaItem,
    moveAgendaItem,
    rescheduleAgendaItem,
    copyAgendaItem,
    resetToDefault,
    exportData,
    importData,
  } = useMatrizData();

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [practicaDialogOpen, setPracticaDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [editingPractica, setEditingPractica] = useState<Practica | null>(null);
  const [schedulingPractica, setSchedulingPractica] = useState<Practica | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [quickAddSlot, setQuickAddSlot] = useState<{ dia: string; franja: string } | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [avisosActivos, setAvisosActivos] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    practica: Practica;
    item: AgendaItem;
    dia: string;
    franja: string;
  } | null>(null);

  useEffect(() => {
    setAvisosActivos(avisosActivadosEnDispositivo());
  }, []);

  const getPracticasByModule = (moduleId: string) => practicas.filter(p => p.modulo === moduleId);

  const handleEditPractica = (practica: Practica) => {
    setEditingPractica(practica);
    setPracticaDialogOpen(true);
  };

  const handleDeletePractica = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta práctica?')) {
      deletePractica(id);
    }
  };

  const handleSavePractica = (practicaData: Omit<Practica, 'id'> & { id?: string }) => {
    if (practicaData.id) {
      updatePractica(practicaData.id, practicaData);
    } else {
      addPractica(practicaData);
    }
    setEditingPractica(null);
  };

  const handleAddToSchedule = (practica: Practica) => {
    setSchedulingPractica(practica);
    setScheduleDialogOpen(true);
  };

  const handleScheduleAdd = (practicaId: string, dia: string, franja: string, opciones: OpcionesHorario) => {
    addToSchedule({ practicaId, dia, franja, ...opciones });
  };

  const handleMultiScheduleAdd = (
    practicaId: string,
    dias: string[],
    franjas: string[],
    opciones: OpcionesHorario,
  ) => {
    addToMultipleSchedules(practicaId, dias, franjas, opciones);
  };

  const handleQuickAdd = (dia: string, franja: string) => {
    setQuickAddSlot({ dia, franja });
    setQuickAddDialogOpen(true);
  };

  const handleEditItem = (practica: Practica, item: AgendaItem, dia: string, franja: string) => {
    setEditingItem({ practica, item, dia, franja });
    setRescheduleDialogOpen(true);
  };

  const handleToggleAvisos = async () => {
    if (avisosActivos) {
      await desactivarAvisos();
      setAvisosActivos(false);
      toast({ title: 'Avisos desactivados', description: MENSAJES.recordatorioDesactivado });
      return;
    }

    if (!soportaPush()) {
      toast({ title: 'No disponible aquí', description: MENSAJES.noSoportado, variant: 'destructive' });
      return;
    }

    const resultado = await activarAvisos();
    if (resultado.ok) {
      setAvisosActivos(true);
      toast({ title: '¡Avisos activados! 🔔', description: 'Te avisaremos antes de cada práctica con hora.' });
      return;
    }

    toast({
      title: 'No pudimos activar los avisos',
      description:
        resultado.motivo === 'permiso'
          ? MENSAJES.permisoDenegado
          : resultado.motivo === 'sin-service-worker'
            ? 'Instala la app en tu pantalla de inicio y vuelve a intentarlo.'
            : MENSAJES.noSoportado,
      variant: 'destructive',
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
      event.target.value = '';
    }
  };

  const selectedModuleConfig = selectedModule ? modulosConfig.find(m => m.id === selectedModule) : null;
  const modulosPrincipales = modulosConfig.filter(m => m.esPrincipal);
  const modulosAuxiliares = modulosConfig.filter(m => !m.esPrincipal);

  const minutosPorDia = Math.round(
    horarios.reduce(
      (acc, h) =>
        acc +
        h.items.reduce((sub, item) => {
          const practica = practicas.find(p => p.id === item.practicaId);
          return sub + (practica?.duracion || 0);
        }, 0),
      0,
    ) / 7,
  );

  // Botón atrás de Android: cierra diálogos y luego vuelve al inicio
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      const isAnyDialogOpen =
        practicaDialogOpen || scheduleDialogOpen || quickAddDialogOpen || rescheduleDialogOpen;

      if (isAnyDialogOpen) {
        event.preventDefault();
        setPracticaDialogOpen(false);
        setScheduleDialogOpen(false);
        setQuickAddDialogOpen(false);
        setRescheduleDialogOpen(false);
        setEditingPractica(null);
        setSchedulingPractica(null);
        setQuickAddSlot(null);
        setEditingItem(null);
        window.history.pushState(null, '', window.location.pathname);
      } else if (showSchedule || selectedModule) {
        event.preventDefault();
        if (selectedModule) setSelectedModule(null);
        else if (showSchedule) setShowSchedule(false);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [showSchedule, selectedModule, practicaDialogOpen, scheduleDialogOpen, quickAddDialogOpen, rescheduleDialogOpen]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl">🌟</div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">Matriz Integral</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Mi práctica diaria con Ken Wilber</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant={showSchedule ? 'secondary' : 'default'}
                size="sm"
                onClick={() => setShowSchedule(!showSchedule)}
                className={cn(
                  'min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm flex-1 sm:flex-initial transition-all font-semibold rounded-lg shadow-sm',
                  showSchedule
                    ? 'bg-[#FFB74D] text-gray-900 hover:bg-[#FB923C] hover:shadow-md hover:scale-105'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105',
                )}
              >
                <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="truncate">{showSchedule ? 'Ver Módulos' : 'Mi Agenda'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAvisos}
                className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
              >
                {avisosActivos ? <Bell className="h-4 w-4 mr-1 sm:mr-2" /> : <BellOff className="h-4 w-4 mr-1 sm:mr-2" />}
                <span className="hidden sm:inline">{avisosActivos ? 'Avisos ON' : 'Avisos'}</span>
                <span className="sm:hidden">{avisosActivos ? 'ON' : 'Avisos'}</span>
              </Button>

              <Button variant="outline" size="sm" onClick={exportData} className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Exp</span>
              </Button>

              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm">
                  <span>
                    <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Importar</span>
                    <span className="sm:hidden">Imp</span>
                  </span>
                </Button>
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              {showSchedule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" />
                  <span>Limpiar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 pb-safe">
        {showSchedule ? (
          <WeeklySchedule
            horarios={horarios}
            practicas={practicas}
            onRemoveItem={removeAgendaItem}
            onMoveItem={moveAgendaItem}
            onQuickAdd={handleQuickAdd}
            onEditItem={handleEditItem}
          />
        ) : selectedModule ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                  variant="default"
                  onClick={() => setSelectedModule(null)}
                  className="min-h-[44px] px-4 self-start transition-all bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105"
                >
                  ← Volver a módulos
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-xl sm:text-2xl">{selectedModuleConfig?.icono}</div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                      {selectedModuleConfig?.nombre}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {getPracticasByModule(selectedModule).length} prácticas disponibles
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setPracticaDialogOpen(true)} className="min-h-[44px] px-4 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Práctica
              </Button>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {getPracticasByModule(selectedModule).map(practica => (
                <PracticaCard
                  key={practica.id}
                  practica={practica}
                  onEdit={() => handleEditPractica(practica)}
                  onDelete={() => handleDeletePractica(practica.id)}
                  onAddToSchedule={() => handleAddToSchedule(practica)}
                />
              ))}

              {getPracticasByModule(selectedModule).length === 0 && (
                <Card className="p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-4xl mb-4">📝</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No hay prácticas aún</h3>
                  <p className="text-sm text-muted-foreground mb-4">Añade tu primera práctica a este módulo</p>
                  <Button onClick={() => setPracticaDialogOpen(true)} className="min-h-[44px] px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Práctica
                  </Button>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl">🌟</div>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight px-4">
                ¡Bienvenido a tu Matriz Integral!
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Explora los diferentes módulos y organiza tus prácticas diarias. Cada color representa un aspecto
                importante de tu crecimiento.
              </p>
            </div>

            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-2">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Módulos Principales</h3>
                <Badge variant="secondary" className="text-xs">Los 4 cuadrantes</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {modulosPrincipales.map(modulo => (
                  <ModuleCard
                    key={modulo.id}
                    modulo={modulo}
                    practicasCount={getPracticasByModule(modulo.id).length}
                    onClick={() => setSelectedModule(modulo.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-2">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Módulos Auxiliares</h3>
                <Badge variant="outline" className="text-xs">Apoyo integral</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {modulosAuxiliares.map(modulo => (
                  <ModuleCard
                    key={modulo.id}
                    modulo={modulo}
                    practicasCount={getPracticasByModule(modulo.id).length}
                    onClick={() => setSelectedModule(modulo.id)}
                    className="min-h-[100px] sm:min-h-[120px]"
                  />
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl mb-2">📚</div>
                <div className="text-xl sm:text-2xl font-bold">{practicas.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Prácticas totales</div>
              </Card>

              <Card className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl mb-2">📅</div>
                <div className="text-xl sm:text-2xl font-bold">{totalItems(horarios)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">En mi agenda</div>
              </Card>

              <Card className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl mb-2">⚡</div>
                <div className="text-xl sm:text-2xl font-bold">{minutosPorDia}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Min/día promedio</div>
              </Card>
            </section>
          </div>
        )}
      </main>

      <PracticaDialog
        open={practicaDialogOpen}
        onOpenChange={open => {
          setPracticaDialogOpen(open);
          if (!open) setEditingPractica(null);
        }}
        practica={editingPractica}
        onSave={handleSavePractica}
        currentModule={selectedModule || undefined}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        practica={schedulingPractica}
        onAddToSchedule={handleScheduleAdd}
        onAddToMultipleSchedules={handleMultiScheduleAdd}
      />

      <QuickAddDialog
        open={quickAddDialogOpen}
        onOpenChange={setQuickAddDialogOpen}
        dia={quickAddSlot?.dia || ''}
        franja={quickAddSlot?.franja || ''}
        practicas={practicas}
        onAddToSchedule={handleScheduleAdd}
      />

      <RescheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={open => {
          setRescheduleDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        practica={editingItem?.practica || null}
        item={editingItem?.item || null}
        currentDia={editingItem?.dia || ''}
        currentFranja={editingItem?.franja || ''}
        onSaveItem={updateAgendaItem}
        onReschedule={rescheduleAgendaItem}
        onCopyToDays={copyAgendaItem}
        onDeleteItem={removeAgendaItem}
      />
    </div>
  );
};

export default Index;
