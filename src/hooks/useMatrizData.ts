import { useCallback, useEffect, useRef, useState } from 'react';
import { AgendaItem, HorarioEntry, Practica } from '@/types/matriz';
import { practicasIniciales } from '@/data/matrizData';
import { toast } from '@/hooks/use-toast';
import {
  DatosAlta,
  actualizarItem,
  anadirItem,
  anadirItemsMultiples,
  buscarItem,
  construirExportacion,
  copiarItemADias,
  eliminarCelda,
  eliminarItem,
  eliminarPracticaDeAgenda,
  leerImportacion,
  migrarHorarios,
  moverItem,
  moverItemACelda,
  recopilarRecordatorios,
} from '@/lib/agenda';
import { MENSAJES } from '@/lib/mensajesRecordatorio';
import { sincronizarRecordatorios } from '@/lib/push';

const STORAGE_KEYS = {
  PRACTICAS: 'matriz-practicas',
  HORARIOS: 'matriz-horarios',
};

export const useMatrizData = () => {
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [horarios, setHorarios] = useState<HorarioEntry[]>([]);
  const [cargado, setCargado] = useState(false);
  const ultimaSync = useRef<string>('');

  // Cargar y migrar datos guardados en este dispositivo
  useEffect(() => {
    try {
      const storedPracticas = localStorage.getItem(STORAGE_KEYS.PRACTICAS);
      setPracticas(storedPracticas ? JSON.parse(storedPracticas) : practicasIniciales);
    } catch {
      setPracticas(practicasIniciales);
    }

    try {
      const storedHorarios = localStorage.getItem(STORAGE_KEYS.HORARIOS);
      setHorarios(storedHorarios ? migrarHorarios(JSON.parse(storedHorarios)) : []);
    } catch {
      setHorarios([]);
    }

    setCargado(true);
  }, []);

  // Persistencia local (sólo después de hidratar, para no borrar datos)
  useEffect(() => {
    if (!cargado) return;
    localStorage.setItem(STORAGE_KEYS.PRACTICAS, JSON.stringify(practicas));
  }, [practicas, cargado]);

  useEffect(() => {
    if (!cargado) return;
    localStorage.setItem(STORAGE_KEYS.HORARIOS, JSON.stringify(horarios));
  }, [horarios, cargado]);

  // Sincronizar recordatorios (se reintenta solo cuando vuelve la conexión)
  useEffect(() => {
    if (!cargado) return;
    const recordatorios = recopilarRecordatorios(horarios, practicas);
    const huella = JSON.stringify(recordatorios);
    if (huella === ultimaSync.current) return;
    ultimaSync.current = huella;
    void sincronizarRecordatorios(recordatorios);
  }, [horarios, practicas, cargado]);

  const avisoLimite = (motivo?: 'limite' | 'duplicado') => {
    toast({
      title: motivo === 'duplicado' ? 'Ya está programada' : '¡Límite alcanzado!',
      description: motivo === 'duplicado' ? MENSAJES.duplicado : MENSAJES.limiteCelda,
      variant: 'destructive',
    });
  };

  const addPractica = (practica: Omit<Practica, 'id'>) => {
    const newPractica: Practica = {
      ...practica,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    setPracticas(prev => [...prev, newPractica]);
    toast({ title: 'Práctica añadida', description: `"${practica.titulo}" se ha añadido correctamente.` });
  };

  const updatePractica = (id: string, practica: Omit<Practica, 'id'>) => {
    setPracticas(prev => prev.map(p => (p.id === id ? { ...practica, id } : p)));
    toast({ title: 'Práctica actualizada', description: `"${practica.titulo}" se ha actualizado.` });
  };

  const deletePractica = (id: string) => {
    const practica = practicas.find(p => p.id === id);
    setPracticas(prev => prev.filter(p => p.id !== id));
    setHorarios(prev => eliminarPracticaDeAgenda(prev, id));
    toast({ title: 'Práctica eliminada', description: `"${practica?.titulo}" se ha eliminado.` });
  };

  /** Añade una ocurrencia con hora y recordatorio propios. */
  const addToSchedule = useCallback((datos: DatosAlta) => {
    setHorarios(prev => {
      const resultado = anadirItem(prev, datos);
      if (!resultado.ok) {
        avisoLimite(resultado.motivo);
        return prev;
      }
      return resultado.horarios;
    });
  }, []);

  const addToMultipleSchedules = useCallback(
    (
      practicaId: string,
      dias: string[],
      franjas: string[],
      opciones: { hora?: string | null; recordatorio?: boolean; minutosAntes?: number } = {},
    ) => {
      setHorarios(prev => {
        const { horarios: siguientes, anadidos, omitidos } = anadirItemsMultiples(
          prev,
          practicaId,
          dias,
          franjas,
          opciones,
        );
        if (anadidos === 0) {
          avisoLimite(omitidos > 0 ? 'limite' : undefined);
          return prev;
        }
        toast({
          title: '✅ Añadido a la agenda',
          description:
            omitidos > 0
              ? `${anadidos} programaciones creadas. ${omitidos} no cupieron.`
              : `${anadidos} programación(es) creada(s).`,
        });
        return siguientes;
      });
    },
    [],
  );

  const updateAgendaItem = useCallback(
    (itemId: string, cambios: Partial<Pick<AgendaItem, 'hora' | 'recordatorio' | 'minutosAntes'>>) => {
      setHorarios(prev => actualizarItem(prev, itemId, cambios));
    },
    [],
  );

  const removeAgendaItem = useCallback((itemId: string) => {
    setHorarios(prev => eliminarItem(prev, itemId));
    toast({ title: 'Eliminado de la agenda', description: 'La actividad se quitó de ese momento.' });
  }, []);

  const removeCell = useCallback((horarioId: string) => {
    setHorarios(prev => eliminarCelda(prev, horarioId));
  }, []);

  const moveAgendaItem = useCallback((itemId: string, direction: 'up' | 'down') => {
    setHorarios(prev => moverItem(prev, itemId, direction));
  }, []);

  const rescheduleAgendaItem = useCallback((itemId: string, dia: string, franja: string) => {
    setHorarios(prev => {
      const resultado = moverItemACelda(prev, itemId, dia, franja);
      if (!resultado.ok) {
        avisoLimite(resultado.motivo);
        return prev;
      }
      return resultado.horarios;
    });
    toast({ title: 'Actividad movida', description: 'Se cambió de día u horario.' });
  }, []);

  const copyAgendaItem = useCallback((itemId: string, dias: string[], franjas?: string[]) => {
    setHorarios(prev => {
      const { horarios: siguientes, copiados, omitidos } = copiarItemADias(prev, itemId, dias, franjas);
      if (copiados === 0) {
        avisoLimite(omitidos > 0 ? 'limite' : undefined);
        return prev;
      }
      toast({
        title: '📋 Copiada',
        description:
          omitidos > 0
            ? `Copiada ${copiados} vez/veces. ${omitidos} no cupieron.`
            : `Copiada ${copiados} vez/veces con su hora y su aviso.`,
      });
      return siguientes;
    });
  }, []);

  const findAgendaItem = useCallback((itemId: string) => buscarItem(horarios, itemId), [horarios]);

  const resetToDefault = () => {
    setHorarios([]);
    toast({
      title: 'Agenda limpiada',
      description: 'Se ha vaciado la agenda semanal. Tus prácticas se mantienen intactas.',
    });
  };

  const exportData = () => {
    const data = construirExportacion(practicas, horarios);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriz-integral-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Datos exportados', description: 'El archivo se ha descargado correctamente.' });
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const { practicas: nuevasPracticas, horarios: nuevosHorarios } = leerImportacion(
          JSON.parse(e.target?.result as string),
        );
        if (!nuevasPracticas && !nuevosHorarios) throw new Error('formato');
        if (nuevasPracticas) setPracticas(nuevasPracticas);
        if (nuevosHorarios) setHorarios(nuevosHorarios);
        toast({ title: 'Datos importados', description: 'Los datos se han importado correctamente.' });
      } catch {
        toast({
          title: 'Error al importar',
          description: 'El archivo no tiene el formato correcto.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return {
    practicas,
    horarios,
    addPractica,
    updatePractica,
    deletePractica,
    addToSchedule,
    addToMultipleSchedules,
    updateAgendaItem,
    removeAgendaItem,
    removeCell,
    moveAgendaItem,
    rescheduleAgendaItem,
    copyAgendaItem,
    findAgendaItem,
    resetToDefault,
    exportData,
    importData,
  };
};
