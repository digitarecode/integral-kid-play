import { describe, expect, it } from 'vitest';
import {
  MAX_ITEMS_POR_CELDA,
  actualizarItem,
  anadirItem,
  buscarItem,
  copiarItemADias,
  eliminarItem,
  leerImportacion,
  migrarHorarios,
  moverItemACelda,
  ordenarItems,
  recopilarRecordatorios,
  totalItems,
} from './agenda';
import { HorarioEntry, Practica } from '@/types/matriz';

const practicas: Practica[] = [
  { id: 'p1', titulo: 'Yoga', descripcion: '', duracion: 20, nivel: 'facil', modulo: 'cuerpo' },
  { id: 'p2', titulo: 'Meditar', descripcion: '', duracion: 10, nivel: 'facil', modulo: 'espiritu' },
];

const conItem = () => {
  const { horarios } = anadirItem([], {
    practicaId: 'p1',
    dia: 'lunes',
    franja: 'mañana',
    hora: '07:30',
    recordatorio: true,
    minutosAntes: 15,
  });
  return horarios;
};

describe('migración de formatos antiguos', () => {
  it('migra el formato v0 con practicaId', () => {
    const res = migrarHorarios([{ id: 'h1', dia: 'lunes', franja: 'tarde', practicaId: 'p1' }]);
    expect(res[0].items).toHaveLength(1);
    expect(res[0].items[0].practicaId).toBe('p1');
    expect(res[0].items[0].hora).toBeNull();
    expect(res[0].items[0].recordatorio).toBe(false);
  });

  it('migra el formato v1 con practicaIds y respeta el límite', () => {
    const res = migrarHorarios([
      { id: 'h1', dia: 'lunes', franja: 'tarde', practicaIds: ['p1', 'p2', 'p1', 'p2'] },
    ]);
    expect(res[0].items).toHaveLength(MAX_ITEMS_POR_CELDA);
  });

  it('fusiona celdas duplicadas del mismo día y franja', () => {
    const res = migrarHorarios([
      { id: 'a', dia: 'lunes', franja: 'tarde', practicaIds: ['p1'] },
      { id: 'b', dia: 'lunes', franja: 'tarde', practicaIds: ['p2'] },
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].items).toHaveLength(2);
  });

  it('conserva hora y recordatorio del formato v2', () => {
    const res = migrarHorarios([
      {
        id: 'h1',
        dia: 'martes',
        franja: 'noche',
        items: [{ id: 'i1', practicaId: 'p2', hora: '20:00', recordatorio: true, minutosAntes: 5 }],
      },
    ]);
    expect(res[0].items[0]).toMatchObject({ hora: '20:00', recordatorio: true, minutosAntes: 5 });
  });

  it('descarta datos corruptos sin lanzar errores', () => {
    expect(migrarHorarios(null)).toEqual([]);
    expect(migrarHorarios([null, {}, { dia: 'lunes' }])).toEqual([]);
  });
});

describe('ocurrencias con hora y recordatorio propios', () => {
  it('añade una ocurrencia con hora exacta', () => {
    const horarios = conItem();
    expect(horarios[0].items[0]).toMatchObject({ hora: '07:30', recordatorio: true, minutosAntes: 15 });
  });

  it('permite la misma práctica dos veces a horas distintas', () => {
    const primera = conItem();
    const { horarios, ok } = anadirItem(primera, {
      practicaId: 'p1',
      dia: 'lunes',
      franja: 'mañana',
      hora: '09:00',
    });
    expect(ok).toBe(true);
    expect(horarios[0].items).toHaveLength(2);
  });

  it('rechaza duplicados exactos', () => {
    const primera = conItem();
    const res = anadirItem(primera, { practicaId: 'p1', dia: 'lunes', franja: 'mañana', hora: '07:30' });
    expect(res.ok).toBe(false);
    expect(res.motivo).toBe('duplicado');
  });

  it('mantiene el límite de 3 por celda', () => {
    let horarios: HorarioEntry[] = [];
    for (const hora of ['07:00', '08:00', '09:00']) {
      horarios = anadirItem(horarios, { practicaId: 'p1', dia: 'lunes', franja: 'mañana', hora }).horarios;
    }
    const res = anadirItem(horarios, { practicaId: 'p2', dia: 'lunes', franja: 'mañana', hora: '10:00' });
    expect(res.ok).toBe(false);
    expect(res.motivo).toBe('limite');
  });

  it('edita sólo la ocurrencia indicada', () => {
    let horarios = conItem();
    horarios = anadirItem(horarios, { practicaId: 'p1', dia: 'martes', franja: 'mañana', hora: '07:30', recordatorio: true }).horarios;
    const objetivo = horarios[0].items[0].id;
    const actualizados = actualizarItem(horarios, objetivo, { hora: '06:15', recordatorio: false });
    expect(buscarItem(actualizados, objetivo)!.item).toMatchObject({ hora: '06:15', recordatorio: false });
    expect(actualizados[1].items[0]).toMatchObject({ hora: '07:30', recordatorio: true });
  });

  it('ordena por hora y deja al final las que no tienen hora', () => {
    const items = ordenarItems([
      { id: 'a', practicaId: 'p1', hora: null, recordatorio: false, minutosAntes: 10 },
      { id: 'b', practicaId: 'p1', hora: '18:00', recordatorio: false, minutosAntes: 10 },
      { id: 'c', practicaId: 'p1', hora: '07:00', recordatorio: false, minutosAntes: 10 },
    ]);
    expect(items.map(i => i.id)).toEqual(['c', 'b', 'a']);
  });
});

describe('copiar y reprogramar ocurrencias', () => {
  it('copia una ocurrencia a otros días conservando hora y aviso', () => {
    const horarios = conItem();
    const itemId = horarios[0].items[0].id;
    const res = copiarItemADias(horarios, itemId, ['martes', 'jueves']);
    expect(res.copiados).toBe(2);
    expect(totalItems(res.horarios)).toBe(3);
    const copia = res.horarios.find(h => h.dia === 'jueves')!.items[0];
    expect(copia).toMatchObject({ hora: '07:30', recordatorio: true, minutosAntes: 15 });
    expect(copia.id).not.toBe(itemId);
  });

  it('no duplica en el día de origen', () => {
    const horarios = conItem();
    const res = copiarItemADias(horarios, horarios[0].items[0].id, ['lunes']);
    expect(res.copiados).toBe(0);
    expect(totalItems(res.horarios)).toBe(1);
  });

  it('reprograma conservando hora y recordatorio', () => {
    const horarios = conItem();
    const itemId = horarios[0].items[0].id;
    const res = moverItemACelda(horarios, itemId, 'domingo', 'noche');
    expect(res.ok).toBe(true);
    expect(res.horarios).toHaveLength(1);
    expect(res.horarios[0]).toMatchObject({ dia: 'domingo', franja: 'noche' });
    expect(res.horarios[0].items[0]).toMatchObject({ id: itemId, hora: '07:30', recordatorio: true });
  });

  it('elimina la celda cuando se queda vacía', () => {
    const horarios = conItem();
    expect(eliminarItem(horarios, horarios[0].items[0].id)).toEqual([]);
  });
});

describe('recordatorios e importación', () => {
  it('sólo genera recordatorios con hora y aviso activos', () => {
    let horarios = conItem();
    horarios = anadirItem(horarios, { practicaId: 'p2', dia: 'martes', franja: 'noche', recordatorio: true }).horarios;
    horarios = anadirItem(horarios, { practicaId: 'p2', dia: 'jueves', franja: 'noche', hora: '20:00' }).horarios;
    const recordatorios = recopilarRecordatorios(horarios, practicas);
    expect(recordatorios).toHaveLength(1);
    expect(recordatorios[0]).toMatchObject({
      activity_title: 'Yoga',
      day_of_week: 1,
      local_time: '07:30',
      minutes_before: 15,
    });
  });

  it('importa el esquema v2 y migra el antiguo', () => {
    const antiguo = leerImportacion({ practicas, horarios: [{ dia: 'lunes', franja: 'tarde', practicaIds: ['p1'] }] });
    expect(antiguo.horarios![0].items[0].practicaId).toBe('p1');
    const invalido = leerImportacion('nope');
    expect(invalido.horarios).toBeNull();
  });
});
