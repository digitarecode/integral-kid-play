import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModuleCard } from '@/components/ModuleCard';
import { PracticaCard } from '@/components/PracticaCard';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { PracticaDialog } from '@/components/PracticaDialog';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { useMatrizData } from '@/hooks/useMatrizData';
import { modulosConfig } from '@/data/matrizData';
import { Practica } from '@/types/matriz';
import { 
  Plus, 
  Calendar, 
  Download, 
  Upload, 
  RotateCcw, 
  BookOpen, 
  Star,
  Camera 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const {
    practicas,
    horarios,
    addPractica,
    updatePractica,
    deletePractica,
    addToSchedule,
    removeFromSchedule,
    moveActivityInSchedule,
    resetToDefault,
    exportData,
    importData
  } = useMatrizData();

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [practicaDialogOpen, setPracticaDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingPractica, setEditingPractica] = useState<Practica | null>(null);
  const [schedulingPractica, setSchedulingPractica] = useState<Practica | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const getPracticasByModule = (moduleId: string) => {
    return practicas.filter(p => p.modulo === moduleId);
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
  };

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

  const handleScheduleAdd = (practicaId: string, dia: string, franja: string) => {
    addToSchedule(practicaId, dia, franja);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
      event.target.value = '';
    }
  };

  const handleSaveScheduleAsImage = async () => {
    try {
      const scheduleElement = document.getElementById('weekly-schedule');
      if (!scheduleElement) {
        toast({
          title: "Error",
          description: "No se pudo encontrar el calendario para capturar",
          variant: "destructive"
        });
        return;
      }

      // Configuración optimizada para captura de texto completo
      const canvas = await html2canvas(scheduleElement, {
        backgroundColor: '#ffffff',
        scale: 3, // Mayor escala para mejor calidad de texto
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: true,
        width: scheduleElement.scrollWidth,
        height: scheduleElement.scrollHeight
      });

      // Convertir canvas a blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const fileName = 'mi_semana.png';

        // Intentar usar Web Share API en móviles
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
          try {
            await navigator.share({
              files: [new File([blob], fileName, { type: 'image/png' })],
              title: 'Mi Agenda Semanal',
              text: '¡Mira mi agenda de prácticas integrales!'
            });
            toast({
              title: "¡Imagen compartida!",
              description: "Tu agenda se compartió exitosamente"
            });
            return;
          } catch (error) {
            // Si falla el share, continuar con descarga normal
            console.log('Share API failed, falling back to download');
          }
        }

        // Descarga tradicional
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "¡Tu semana se guardó como imagen!",
          description: "La imagen se descargó exitosamente"
        });
      }, 'image/png');

    } catch (error) {
      console.error('Error capturing schedule:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la imagen",
        variant: "destructive"
      });
    }
  };

  const selectedModuleConfig = selectedModule ? 
    modulosConfig.find(m => m.id === selectedModule) : null;

  const modulosPrincipales = modulosConfig.filter(m => m.esPrincipal);
  const modulosAuxiliares = modulosConfig.filter(m => !m.esPrincipal);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌟</div>
              <div>
                <h1 className="text-2xl font-bold">Matriz Integral</h1>
                <p className="text-sm text-muted-foreground">
                  Mi práctica diaria con Ken Wilber
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {showSchedule ? 'Ver Módulos' : 'Mi Agenda'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              {showSchedule && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveScheduleAsImage}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Guardar imagen
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={resetToDefault}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showSchedule ? (
          /* Vista de Agenda */
          <WeeklySchedule
            horarios={horarios}
            practicas={practicas}
            onRemoveFromSchedule={removeFromSchedule}
          />
        ) : selectedModule ? (
          /* Vista de prácticas de un módulo */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBackToModules}>
                  ← Volver a módulos
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedModuleConfig?.icono}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedModuleConfig?.nombre}</h2>
                    <p className="text-muted-foreground">
                      {getPracticasByModule(selectedModule).length} prácticas disponibles
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setPracticaDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Práctica
              </Button>
            </div>

            <div className="grid gap-4">
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
                <Card className="p-8 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No hay prácticas aún</h3>
                  <p className="text-muted-foreground mb-4">
                    Añade tu primera práctica a este módulo
                  </p>
                  <Button onClick={() => setPracticaDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Práctica
                  </Button>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Vista principal de módulos */
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="text-6xl">🌟</div>
              </div>
              <h2 className="text-3xl font-bold">¡Bienvenido a tu Matriz Integral!</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explora los diferentes módulos y organiza tus prácticas diarias. 
                Cada color representa un aspecto importante de tu crecimiento.
              </p>
            </div>

            {/* Módulos Principales */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Star className="h-6 w-6 text-yellow-500" />
                <h3 className="text-2xl font-bold">Módulos Principales</h3>
                <Badge variant="secondary">Los 4 cuadrantes</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {modulosPrincipales.map(modulo => (
                  <ModuleCard
                    key={modulo.id}
                    modulo={modulo}
                    practicasCount={getPracticasByModule(modulo.id).length}
                    onClick={() => handleModuleClick(modulo.id)}
                  />
                ))}
              </div>
            </section>

            {/* Módulos Auxiliares */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <h3 className="text-2xl font-bold">Módulos Auxiliares</h3>
                <Badge variant="outline">Apoyo integral</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {modulosAuxiliares.map(modulo => (
                  <ModuleCard
                    key={modulo.id}
                    modulo={modulo}
                    practicasCount={getPracticasByModule(modulo.id).length}
                    onClick={() => handleModuleClick(modulo.id)}
                    className="min-h-[120px]"
                  />
                ))}
              </div>
            </section>

            {/* Stats rápidas */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold">{practicas.length}</div>
                <div className="text-sm text-muted-foreground">Prácticas totales</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold">{horarios.length}</div>
                <div className="text-sm text-muted-foreground">En mi agenda</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold">
                  {Math.round(horarios.reduce((acc, h) => {
                    // Compatibilidad hacia atrás: manejar tanto estructura nueva como antigua
                    const practicaIds = h.practicaIds || (h as any).practicaId ? [(h as any).practicaId] : [];
                    return acc + practicaIds.reduce((subAcc, practicaId) => {
                      const practica = practicas.find(p => p.id === practicaId);
                      return subAcc + (practica?.duracion || 0);
                    }, 0);
                  }, 0) / 7)}
                </div>
                <div className="text-sm text-muted-foreground">Min/día promedio</div>
              </Card>
            </section>
          </div>
        )}
      </main>

      {/* Toaster para notificaciones */}
      <div id="toast-container"></div>

      {/* Dialogs */}
      <PracticaDialog
        open={practicaDialogOpen}
        onOpenChange={(open) => {
          setPracticaDialogOpen(open);
          if (!open) setEditingPractica(null);
        }}
        practica={editingPractica}
        onSave={handleSavePractica}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        practica={schedulingPractica}
        onAddToSchedule={handleScheduleAdd}
      />
    </div>
  );
};

export default Index;
