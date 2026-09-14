export interface Practica {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: number; // en minutos
  nivel: 'facil' | 'intermedio' | 'avanzado';
  modulo: string;
  icono?: string;
}

export interface ModuloConfig {
  id: string;
  nombre: string;
  color: string;
  icono: string;
  esPrincipal: boolean;
}

/**
 * Una ocurrencia programada: una práctica colocada en un día + franja concretos,
 * con su propia hora exacta y su propio recordatorio independiente.
 */
export interface AgendaItem {
  id: string;
  practicaId: string;
  /** Hora local exacta "HH:mm" o null si sólo se usa la franja. */
  hora: string | null;
  recordatorio: boolean;
  /** Minutos de antelación del recordatorio (0 | 5 | 10 | 15 | 30). */
  minutosAntes: number;
}

export interface HorarioEntry {
  id: string;
  dia: string;
  franja: string;
  items: AgendaItem[];
  /** @deprecated formato antiguo, se migra automáticamente al cargar. */
  practicaIds?: string[];
  /** @deprecated formato antiguo, se migra automáticamente al cargar. */
  practicaId?: string;
}

export interface AgendaExport {
  schemaVersion: 2;
  exportDate: string;
  practicas: Practica[];
  horarios: HorarioEntry[];
}

export type FranjaHoraria = 'mañana' | 'media-mañana' | 'tarde' | 'noche';
export type DiaSemanaq = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
