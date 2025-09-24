import { useState, useEffect } from 'react';
import { Practica, HorarioEntry } from '@/types/matriz';
import { practicasIniciales } from '@/data/matrizData';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEYS = {
  PRACTICAS: 'matriz-practicas',
  HORARIOS: 'matriz-horarios'
};

export const useMatrizData = () => {
  const [practicas, setPracticas] = useState<Practica[]>([]);
  const [horarios, setHorarios] = useState<HorarioEntry[]>([]);

  // Cargar datos del localStorage al inicio
  useEffect(() => {
    const storedPracticas = localStorage.getItem(STORAGE_KEYS.PRACTICAS);
    const storedHorarios = localStorage.getItem(STORAGE_KEYS.HORARIOS);

    if (storedPracticas) {
      setPracticas(JSON.parse(storedPracticas));
    } else {
      setPracticas(practicasIniciales);
    }

    if (storedHorarios) {
      const parsedHorarios = JSON.parse(storedHorarios);
      // Migrar datos antiguos al nuevo formato
      const migratedHorarios = parsedHorarios.map((h: any) => {
        if (h.practicaId && !h.practicaIds) {
          return { ...h, practicaIds: [h.practicaId] };
        }
        return h;
      });
      setHorarios(migratedHorarios);
    }
  }, []);

  // Guardar prácticas en localStorage cuando cambien
  useEffect(() => {
    if (practicas.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PRACTICAS, JSON.stringify(practicas));
    }
  }, [practicas]);

  // Guardar horarios en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HORARIOS, JSON.stringify(horarios));
  }, [horarios]);

  const addPractica = (practica: Omit<Practica, 'id'>) => {
    const newPractica: Practica = {
      ...practica,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setPracticas(prev => [...prev, newPractica]);
    toast({
      title: "Práctica añadida",
      description: `"${practica.titulo}" se ha añadido correctamente.`
    });
  };

  const updatePractica = (id: string, practica: Omit<Practica, 'id'>) => {
    setPracticas(prev => prev.map(p => p.id === id ? { ...practica, id } : p));
    toast({
      title: "Práctica actualizada",
      description: `"${practica.titulo}" se ha actualizado correctamente.`
    });
  };

  const deletePractica = (id: string) => {
    const practica = practicas.find(p => p.id === id);
    setPracticas(prev => prev.filter(p => p.id !== id));
    // Eliminar también de los horarios
    setHorarios(prev => prev.map(h => ({
      ...h,
      practicaIds: h.practicaIds.filter(pId => pId !== id)
    })).filter(h => h.practicaIds.length > 0));
    toast({
      title: "Práctica eliminada",
      description: `"${practica?.titulo}" se ha eliminado correctamente.`
    });
  };

  const addToSchedule = (practicaId: string, dia: string, franja: string) => {
    // Buscar entrada existente para ese día y franja
    const existingEntry = horarios.find(h => h.dia === dia && h.franja === franja);
    
    if (existingEntry) {
      // Verificar si ya tiene 3 actividades
      if (existingEntry.practicaIds.length >= 3) {
        toast({
          title: "¡Límite alcanzado!",
          description: "Solo puedes elegir hasta 3 actividades en este horario.",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar si la práctica ya está asignada
      if (existingEntry.practicaIds.includes(practicaId)) {
        toast({
          title: "Ya programada",
          description: "Esta práctica ya está en este horario.",
          variant: "destructive"
        });
        return;
      }
      
      // Añadir la práctica a la entrada existente
      setHorarios(prev => prev.map(h => 
        h.id === existingEntry.id 
          ? { ...h, practicaIds: [...h.practicaIds, practicaId] }
          : h
      ));
    } else {
      // Crear nueva entrada
      const newEntry: HorarioEntry = {
        id: `horario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        practicaIds: [practicaId],
        dia,
        franja
      };
      setHorarios(prev => [...prev, newEntry]);
    }
    
    const practica = practicas.find(p => p.id === practicaId);
    toast({
      title: "Añadido al horario",
      description: `"${practica?.titulo}" programado para ${dia} en la ${franja}.`
    });
  };

  const removeFromSchedule = (horarioId: string, practicaId?: string) => {
    if (practicaId) {
      // Remover práctica específica de una entrada
      setHorarios(prev => prev.map(h => {
        if (h.id === horarioId) {
          const newPracticaIds = h.practicaIds.filter(id => id !== practicaId);
          return newPracticaIds.length > 0 
            ? { ...h, practicaIds: newPracticaIds }
            : null;
        }
        return h;
      }).filter(Boolean) as HorarioEntry[]);
    } else {
      // Remover toda la entrada
      setHorarios(prev => prev.filter(h => h.id !== horarioId));
    }
    
    toast({
      title: "Eliminado del horario",
      description: "La práctica se ha eliminado del horario."
    });
  };

  const resetToDefault = () => {
    setPracticas(practicasIniciales);
    setHorarios([]);
    localStorage.removeItem(STORAGE_KEYS.PRACTICAS);
    localStorage.removeItem(STORAGE_KEYS.HORARIOS);
    toast({
      title: "Datos restablecidos",
      description: "Se ha vuelto a la matriz original."
    });
  };

  const exportData = () => {
    const data = {
      practicas,
      horarios,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriz-integral-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Datos exportados",
      description: "El archivo se ha descargado correctamente."
    });
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.practicas && Array.isArray(data.practicas)) {
          setPracticas(data.practicas);
        }
        if (data.horarios && Array.isArray(data.horarios)) {
          setHorarios(data.horarios);
        }
        toast({
          title: "Datos importados",
          description: "Los datos se han importado correctamente."
        });
      } catch (error) {
        toast({
          title: "Error al importar",
          description: "El archivo no tiene el formato correcto.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const moveActivityInSchedule = (horarioId: string, practicaId: string, direction: 'up' | 'down') => {
    setHorarios(prev => prev.map(h => {
      if (h.id === horarioId) {
        const currentIndex = h.practicaIds.indexOf(practicaId);
        if (currentIndex === -1) return h;
        
        const newPracticaIds = [...h.practicaIds];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (targetIndex >= 0 && targetIndex < newPracticaIds.length) {
          [newPracticaIds[currentIndex], newPracticaIds[targetIndex]] = 
          [newPracticaIds[targetIndex], newPracticaIds[currentIndex]];
        }
        
        return { ...h, practicaIds: newPracticaIds };
      }
      return h;
    }));
  };

  return {
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
  };
};