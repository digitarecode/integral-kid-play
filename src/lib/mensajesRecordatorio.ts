/** Textos locales en español para los avisos de la agenda. */

export const tituloRecordatorio = (actividad: string) => `⏰ ¡Casi es hora de ${actividad}!`;

export const cuerpoRecordatorio = (hora: string, minutosAntes: number) => {
  if (minutosAntes <= 0) return `Empieza ahora, a las ${hora}. ¡Vamos! 🌟`;
  if (minutosAntes === 5) return `Empieza en 5 minutos, a las ${hora}. ¡Prepárate! 🌟`;
  return `Empieza en ${minutosAntes} minutos, a las ${hora}. ¡Prepárate! 🌟`;
};

export const MENSAJES = {
  guardadoLocal: 'Guardado en este dispositivo.',
  recordatorioActivado: 'Recordatorio activado.',
  recordatorioDesactivado: 'Recordatorio desactivado.',
  sinConexion: 'Sin conexión: guardado aquí y se sincronizará solo cuando vuelva internet.',
  permisoDenegado: 'No podemos avisarte porque los avisos están bloqueados en el navegador.',
  noSoportado: 'Este navegador no puede mostrar avisos aunque la app esté cerrada.',
  limiteCelda: 'Solo puedes poner hasta 3 actividades en este momento del día.',
  duplicado: 'Esa actividad ya está a esa hora en ese momento del día.',
} as const;
