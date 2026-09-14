import { AgendaExport, AgendaItem, HorarioEntry, Practica } from '@/types/matriz';

export const MAX_ITEMS_POR_CELDA = 3;
export const MINUTOS_ANTES_OPCIONES = [0, 5, 10, 15, 30];
export const MINUTOS_ANTES_DEFECTO = 10;

/** lunes..domingo -> índice JS de día (0 = domingo). */
export const DIA_A_INDICE: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

let contador = 0;
export const nuevoId = (prefijo = 'item') => {
  contador += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contador}-${Math.random().toString(36).slice(2, 8)}`;
};

const HORA_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const normalizarHora = (valor: unknown): string | null => {
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  if (!limpio) return null;
  const partes = limpio.split(':');
  if (partes.length !== 2) return null;
  const hh = partes[0].padStart(2, '0');
  const mm = partes[1].padStart(2, '0');
  const candidato = `${hh}${mm.length > 2 ? mm.slice(0, 2) : mm}`.replace(/^(\d{2})(\d{2})$/, '$1:$2');
  return HORA_RE.test(candidato) ? candidato : null;
};

export const normalizarMinutosAntes = (valor: unknown): number => {
  const n = Number(valor);
  return MINUTOS_ANTES_OPCIONES.includes(n) ? n : MINUTOS_ANTES_DEFECTO;
};

export const horaEnMinutos = (hora: string | null): number | null => {
  const h = normalizarHora(hora);
  if (!h) return null;
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

/** Ordena: primero las ocurrencias con hora (ascendente), después las sin hora. */
export const ordenarItems = (items: AgendaItem[]): AgendaItem[] =>
  items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ma = horaEnMinutos(a.item.hora);
      const mb = horaEnMinutos(b.item.hora);
      if (ma !== null && mb !== null && ma !== mb) return ma - mb;
      if (ma !== null && mb === null) return -1;
      if (ma === null && mb !== null) return 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);

const crearItem = (entrada: Partial<AgendaItem> & { practicaId: string }): AgendaItem => ({
  id: typeof entrada.id === 'string' && entrada.id ? entrada.id : nuevoId('ag'),
  practicaId: entrada.practicaId,
  hora: normalizarHora(entrada.hora),
  recordatorio: entrada.recordatorio === true,
  minutosAntes: normalizarMinutosAntes(entrada.minutosAntes),
});

/**
 * Migración segura de cualquier formato anterior:
 *  v0: { practicaId }
 *  v1: { practicaIds: [] }
 *  v2: { items: [] }
 * Fusiona celdas duplicadas del mismo día+franja y respeta el límite de 3.
 */
export const migrarHorarios = (bruto: unknown): HorarioEntry[] => {
  if (!Array.isArray(bruto)) return [];
  const porCelda = new Map<string, HorarioEntry>();
  const idsUsados = new Set<string>();

  for (const crudo of bruto) {
    if (!crudo || typeof crudo !== 'object') continue;
    const entrada = crudo as Record<string, unknown>;
    const dia = typeof entrada.dia === 'string' ? entrada.dia : '';
    const franja = typeof entrada.franja === 'string' ? entrada.franja : '';
    if (!dia || !franja) continue;

    let items: AgendaItem[] = [];
    if (Array.isArray(entrada.items)) {
      items = (entrada.items as unknown[])
        .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
        .filter(i => typeof i.practicaId === 'string' && i.practicaId)
        .map(i => crearItem(i as Partial<AgendaItem> & { practicaId: string }));
    } else if (Array.isArray(entrada.practicaIds)) {
      items = (entrada.practicaIds as unknown[])
        .filter((id): id is string => typeof id === 'string' && !!id)
        .map(practicaId => crearItem({ practicaId }));
    } else if (typeof entrada.practicaId === 'string' && entrada.practicaId) {
      items = [crearItem({ practicaId: entrada.practicaId })];
    }

    // Evita ids repetidos entre entradas migradas.
    items = items.map(item => {
      if (idsUsados.has(item.id)) return { ...item, id: nuevoId('ag') };
      idsUsados.add(item.id);
      return item;
    });

    const clave = `${dia}|${franja}`;
    const existente = porCelda.get(clave);
    if (existente) {
      existente.items = [...existente.items, ...items].slice(0, MAX_ITEMS_POR_CELDA);
    } else {
      porCelda.set(clave, {
        id: typeof entrada.id === 'string' && entrada.id ? entrada.id : nuevoId('horario'),
        dia,
        franja,
        items: items.slice(0, MAX_ITEMS_POR_CELDA),
      });
    }
  }

  return [...porCelda.values()]
    .map(h => ({ ...h, items: ordenarItems(h.items) }))
    .filter(h => h.items.length > 0);
};

export const buscarItem = (
  horarios: HorarioEntry[],
  itemId: string,
): { horario: HorarioEntry; item: AgendaItem; indice: number } | null => {
  for (const horario of horarios) {
    const indice = horario.items.findIndex(i => i.id === itemId);
    if (indice !== -1) return { horario, item: horario.items[indice], indice };
  }
  return null;
};

export const totalItems = (horarios: HorarioEntry[]) =>
  horarios.reduce((acc, h) => acc + h.items.length, 0);

export type ResultadoAlta = {
  horarios: HorarioEntry[];
  ok: boolean;
  motivo?: 'limite' | 'duplicado';
  itemId?: string;
};

export interface DatosAlta {
  practicaId: string;
  dia: string;
  franja: string;
  hora?: string | null;
  recordatorio?: boolean;
  minutosAntes?: number;
}

export const anadirItem = (horarios: HorarioEntry[], datos: DatosAlta): ResultadoAlta => {
  const celda = horarios.find(h => h.dia === datos.dia && h.franja === datos.franja);
  const nuevo = crearItem({
    practicaId: datos.practicaId,
    hora: datos.hora ?? null,
    recordatorio: datos.recordatorio,
    minutosAntes: datos.minutosAntes,
  });

  if (!celda) {
    return {
      horarios: [...horarios, { id: nuevoId('horario'), dia: datos.dia, franja: datos.franja, items: [nuevo] }],
      ok: true,
      itemId: nuevo.id,
    };
  }

  if (celda.items.length >= MAX_ITEMS_POR_CELDA) {
    return { horarios, ok: false, motivo: 'limite' };
  }
  if (celda.items.some(i => i.practicaId === nuevo.practicaId && i.hora === nuevo.hora)) {
    return { horarios, ok: false, motivo: 'duplicado' };
  }

  return {
    horarios: horarios.map(h =>
      h.id === celda.id ? { ...h, items: ordenarItems([...h.items, nuevo]) } : h,
    ),
    ok: true,
    itemId: nuevo.id,
  };
};

export const anadirItemsMultiples = (
  horarios: HorarioEntry[],
  practicaId: string,
  dias: string[],
  franjas: string[],
  opciones: { hora?: string | null; recordatorio?: boolean; minutosAntes?: number } = {},
) => {
  let resultado = horarios;
  let anadidos = 0;
  let omitidos = 0;
  for (const dia of dias) {
    for (const franja of franjas) {
      const paso = anadirItem(resultado, { practicaId, dia, franja, ...opciones });
      resultado = paso.horarios;
      paso.ok ? (anadidos += 1) : (omitidos += 1);
    }
  }
  return { horarios: resultado, anadidos, omitidos };
};

export const actualizarItem = (
  horarios: HorarioEntry[],
  itemId: string,
  cambios: Partial<Pick<AgendaItem, 'hora' | 'recordatorio' | 'minutosAntes'>>,
): HorarioEntry[] =>
  horarios.map(h => {
    if (!h.items.some(i => i.id === itemId)) return h;
    const items = h.items.map(i =>
      i.id === itemId
        ? {
            ...i,
            hora: 'hora' in cambios ? normalizarHora(cambios.hora) : i.hora,
            recordatorio: 'recordatorio' in cambios ? cambios.recordatorio === true : i.recordatorio,
            minutosAntes:
              'minutosAntes' in cambios ? normalizarMinutosAntes(cambios.minutosAntes) : i.minutosAntes,
          }
        : i,
    );
    return { ...h, items: ordenarItems(items) };
  });

export const eliminarItem = (horarios: HorarioEntry[], itemId: string): HorarioEntry[] =>
  horarios
    .map(h => ({ ...h, items: h.items.filter(i => i.id !== itemId) }))
    .filter(h => h.items.length > 0);

export const eliminarCelda = (horarios: HorarioEntry[], horarioId: string): HorarioEntry[] =>
  horarios.filter(h => h.id !== horarioId);

export const eliminarPracticaDeAgenda = (horarios: HorarioEntry[], practicaId: string): HorarioEntry[] =>
  horarios
    .map(h => ({ ...h, items: h.items.filter(i => i.practicaId !== practicaId) }))
    .filter(h => h.items.length > 0);

export const moverItem = (
  horarios: HorarioEntry[],
  itemId: string,
  direccion: 'up' | 'down',
): HorarioEntry[] =>
  horarios.map(h => {
    const indice = h.items.findIndex(i => i.id === itemId);
    if (indice === -1) return h;
    const destino = direccion === 'up' ? indice - 1 : indice + 1;
    if (destino < 0 || destino >= h.items.length) return h;
    const items = [...h.items];
    [items[indice], items[destino]] = [items[destino], items[indice]];
    return { ...h, items };
  });

/** Reprograma una ocurrencia concreta a otro día/franja conservando hora y recordatorio. */
export const moverItemACelda = (
  horarios: HorarioEntry[],
  itemId: string,
  dia: string,
  franja: string,
): ResultadoAlta => {
  const encontrado = buscarItem(horarios, itemId);
  if (!encontrado) return { horarios, ok: false };
  if (encontrado.horario.dia === dia && encontrado.horario.franja === franja) {
    return { horarios, ok: true, itemId };
  }

  const destino = horarios.find(h => h.dia === dia && h.franja === franja);
  if (destino && destino.items.length >= MAX_ITEMS_POR_CELDA) {
    return { horarios, ok: false, motivo: 'limite' };
  }

  const item = encontrado.item;
  const sinItem = eliminarItem(horarios, itemId);
  const destinoTrasBorrado = sinItem.find(h => h.dia === dia && h.franja === franja);

  if (destinoTrasBorrado) {
    return {
      horarios: sinItem.map(h =>
        h.id === destinoTrasBorrado.id ? { ...h, items: ordenarItems([...h.items, item]) } : h,
      ),
      ok: true,
      itemId,
    };
  }

  return {
    horarios: [...sinItem, { id: nuevoId('horario'), dia, franja, items: [item] }],
    ok: true,
    itemId,
  };
};

/** Copia una ocurrencia existente a otros días (misma franja u otras franjas). */
export const copiarItemADias = (
  horarios: HorarioEntry[],
  itemId: string,
  dias: string[],
  franjas?: string[],
) => {
  const encontrado = buscarItem(horarios, itemId);
  if (!encontrado) return { horarios, copiados: 0, omitidos: 0 };

  const { item, horario } = encontrado;
  const franjasDestino = franjas && franjas.length > 0 ? franjas : [horario.franja];
  let resultado = horarios;
  let copiados = 0;
  let omitidos = 0;

  for (const dia of dias) {
    for (const franja of franjasDestino) {
      if (dia === horario.dia && franja === horario.franja) continue;
      const paso = anadirItem(resultado, {
        practicaId: item.practicaId,
        dia,
        franja,
        hora: item.hora,
        recordatorio: item.recordatorio,
        minutosAntes: item.minutosAntes,
      });
      resultado = paso.horarios;
      paso.ok ? (copiados += 1) : (omitidos += 1);
    }
  }

  return { horarios: resultado, copiados, omitidos };
};

export interface RecordatorioPayload {
  occurrence_id: string;
  practica_id: string;
  activity_title: string;
  module_id: string;
  day_of_week: number;
  local_time: string;
  minutes_before: number;
}

/** Recordatorios activos: sólo ocurrencias con hora exacta y aviso encendido. */
export const recopilarRecordatorios = (
  horarios: HorarioEntry[],
  practicas: Practica[],
): RecordatorioPayload[] => {
  const salida: RecordatorioPayload[] = [];
  for (const horario of horarios) {
    const day = DIA_A_INDICE[horario.dia];
    if (day === undefined) continue;
    for (const item of horario.items) {
      const hora = normalizarHora(item.hora);
      if (!item.recordatorio || !hora) continue;
      const practica = practicas.find(p => p.id === item.practicaId);
      salida.push({
        occurrence_id: item.id,
        practica_id: item.practicaId,
        activity_title: practica?.titulo ?? 'Mi práctica',
        module_id: practica?.modulo ?? 'cuerpo',
        day_of_week: day,
        local_time: hora,
        minutes_before: normalizarMinutosAntes(item.minutosAntes),
      });
    }
  }
  return salida;
};

export const construirExportacion = (
  practicas: Practica[],
  horarios: HorarioEntry[],
): AgendaExport => ({
  schemaVersion: 2,
  exportDate: new Date().toISOString(),
  practicas,
  horarios,
});

export const leerImportacion = (
  bruto: unknown,
): { practicas: Practica[] | null; horarios: HorarioEntry[] | null } => {
  if (!bruto || typeof bruto !== 'object') return { practicas: null, horarios: null };
  const datos = bruto as Record<string, unknown>;
  return {
    practicas: Array.isArray(datos.practicas) ? (datos.practicas as Practica[]) : null,
    horarios: Array.isArray(datos.horarios) ? migrarHorarios(datos.horarios) : null,
  };
};
