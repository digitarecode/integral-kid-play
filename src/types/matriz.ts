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

export interface HorarioEntry {
  id: string;
  practicaId: string;
  dia: string;
  franja: string;
}

export type FranjaHoraria = 'mañana' | 'media-mañana' | 'tarde' | 'noche';
export type DiaSemanaq = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';