import { Practica, ModuloConfig } from '@/types/matriz';

export const modulosConfig: ModuloConfig[] = [
  // Módulos principales
  { id: 'cuerpo', nombre: 'Cuerpo', color: 'cuerpo', icono: '💪', esPrincipal: true },
  { id: 'mente', nombre: 'Mente', color: 'mente', icono: '🧠', esPrincipal: true },
  { id: 'espiritu', nombre: 'Espíritu', color: 'espiritu', icono: '✨', esPrincipal: true },
  { id: 'sombra', nombre: 'Sombra', color: 'sombra', icono: '🌙', esPrincipal: true },
  
  // Módulos auxiliares
  { id: 'etica', nombre: 'Ética', color: 'etica', icono: '⚖️', esPrincipal: false },
  { id: 'sexualidad', nombre: 'Sexualidad', color: 'sexualidad', icono: '💖', esPrincipal: false },
  { id: 'trabajo', nombre: 'Trabajo', color: 'trabajo', icono: '🎯', esPrincipal: false },
  { id: 'emociones', nombre: 'Emociones', color: 'emociones', icono: '😊', esPrincipal: false },
  { id: 'relaciones', nombre: 'Relaciones', color: 'relaciones', icono: '👫', esPrincipal: false },
];

export const practicasIniciales: Practica[] = [
  // CUERPO
  {
    id: 'c1',
    titulo: 'Ejercicios de Fuerza',
    descripcion: 'Movimientos básicos con pesas o peso corporal para fortalecer músculos',
    duracion: 30,
    nivel: 'facil',
    modulo: 'cuerpo',
    icono: '🏋️'
  },
  {
    id: 'c2',
    titulo: 'Cardio Divertido',
    descripcion: 'Ejercicios de resistencia: correr, saltar, bailar para activar el corazón',
    duracion: 20,
    nivel: 'facil',
    modulo: 'cuerpo',
    icono: '🏃'
  },
  {
    id: 'c3',
    titulo: 'Respiración Consciente',
    descripcion: 'Ejercicios para respirar profundo y sentir la energía en el cuerpo',
    duracion: 10,
    nivel: 'facil',
    modulo: 'cuerpo',
    icono: '🌬️'
  },
  {
    id: 'c4',
    titulo: 'Yoga para Niños',
    descripcion: 'Posturas sencillas de yoga para conectar con el cuerpo y la energía',
    duracion: 25,
    nivel: 'intermedio',
    modulo: 'cuerpo',
    icono: '🧘'
  },
  {
    id: 'c5',
    titulo: 'Alimentación Consciente',
    descripcion: 'Comer despacio, saborear los alimentos y agradecer por la comida',
    duracion: 15,
    nivel: 'facil',
    modulo: 'cuerpo',
    icono: '🍎'
  },

  // MENTE
  {
    id: 'm1',
    titulo: 'Explorando Perspectivas',
    descripcion: 'Aprender a ver las cosas desde diferentes puntos de vista (mapa AQAL)',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'mente',
    icono: '🔍'
  },
  {
    id: 'm2',
    titulo: 'Lectura Reflexiva',
    descripcion: 'Leer cuentos o libros y pensar en los mensajes importantes',
    duracion: 30,
    nivel: 'facil',
    modulo: 'mente',
    icono: '📚'
  },
  {
    id: 'm3',
    titulo: 'Escritura Consciente',
    descripcion: 'Escribir sobre mis pensamientos, sentimientos y experiencias del día',
    duracion: 15,
    nivel: 'facil',
    modulo: 'mente',
    icono: '✏️'
  },
  {
    id: 'm4',
    titulo: 'Juegos de Concentración',
    descripcion: 'Rompecabezas, sudokus o juegos que ayuden a enfocar la mente',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'mente',
    icono: '🧩'
  },
  {
    id: 'm5',
    titulo: 'Resolución Integral',
    descripcion: 'Resolver problemas viendo todas las partes y buscando soluciones creativas',
    duracion: 25,
    nivel: 'avanzado',
    modulo: 'mente',
    icono: '💡'
  },

  // ESPÍRITU
  {
    id: 'e1',
    titulo: 'Meditación Simple',
    descripcion: 'Sentarse en silencio y prestar atención a la respiración',
    duracion: 10,
    nivel: 'facil',
    modulo: 'espiritu',
    icono: '🧘‍♀️'
  },
  {
    id: 'e2',
    titulo: '¿Quién Soy?',
    descripcion: 'Preguntarse quién soy realmente y observar qué siento en mi interior',
    duracion: 15,
    nivel: 'intermedio',
    modulo: 'espiritu',
    icono: '🤔'
  },
  {
    id: 'e3',
    titulo: 'Conexión Sagrada',
    descripcion: 'Momentos de oración, contemplación o conexión con algo más grande',
    duracion: 10,
    nivel: 'facil',
    modulo: 'espiritu',
    icono: '🙏'
  },
  {
    id: 'e4',
    titulo: 'Enviando Cariño',
    descripcion: 'Ejercicios para enviar buenos deseos y amor a otras personas',
    duracion: 10,
    nivel: 'facil',
    modulo: 'espiritu',
    icono: '💝'
  },
  {
    id: 'e5',
    titulo: 'Contemplación Natural',
    descripcion: 'Observar la naturaleza y sentir la conexión con todo lo que existe',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'espiritu',
    icono: '🌳'
  },

  // SOMBRA
  {
    id: 's1',
    titulo: 'Técnica 3-2-1',
    descripcion: 'Hablar con mis emociones difíciles como si fueran un personaje amigo',
    duracion: 15,
    nivel: 'intermedio',
    modulo: 'sombra',
    icono: '🎭'
  },
  {
    id: 's2',
    titulo: 'Diario de Sueños',
    descripcion: 'Escribir mis sueños y pensar qué me quieren enseñar',
    duracion: 10,
    nivel: 'facil',
    modulo: 'sombra',
    icono: '💭'
  },
  {
    id: 's3',
    titulo: 'Autoobservación',
    descripcion: 'Escribir lo que siento y pienso cuando estoy molesto o triste',
    duracion: 15,
    nivel: 'facil',
    modulo: 'sombra',
    icono: '🪞'
  },
  {
    id: 's4',
    titulo: 'Integración Emocional',
    descripcion: 'Juegos de roles para entender mejor mis diferentes emociones',
    duracion: 20,
    nivel: 'avanzado',
    modulo: 'sombra',
    icono: '🎪'
  },

  // MÓDULOS AUXILIARES

  // ÉTICA
  {
    id: 'et1',
    titulo: 'Reflexión Diaria',
    descripcion: 'Pensar en mis decisiones del día: ¿fueron buenas para mí y para otros?',
    duracion: 10,
    nivel: 'facil',
    modulo: 'etica',
    icono: '💭'
  },
  {
    id: 'et2',
    titulo: 'Actos de Bondad',
    descripcion: 'Comprometerse a hacer pequeños actos positivos cada día',
    duracion: 5,
    nivel: 'facil',
    modulo: 'etica',
    icono: '🤝'
  },

  // SEXUALIDAD
  {
    id: 'sex1',
    titulo: 'Cuidado Corporal',
    descripcion: 'Aprender a cuidar mi cuerpo con respeto y amor propio',
    duracion: 15,
    nivel: 'facil',
    modulo: 'sexualidad',
    icono: '🛁'
  },
  {
    id: 'sex2',
    titulo: 'Afecto Saludable',
    descripcion: 'Entender los límites del afecto y el respeto hacia otros',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'sexualidad',
    icono: '🤗'
  },

  // TRABAJO
  {
    id: 't1',
    titulo: 'Hábitos de Estudio',
    descripcion: 'Crear rutinas de productividad y organización para las tareas',
    duracion: 30,
    nivel: 'facil',
    modulo: 'trabajo',
    icono: '📝'
  },
  {
    id: 't2',
    titulo: 'Trabajo como Servicio',
    descripcion: 'Ver las tareas como formas de ayudar y contribuir al mundo',
    duracion: 15,
    nivel: 'intermedio',
    modulo: 'trabajo',
    icono: '🌍'
  },
  {
    id: 't3',
    titulo: 'Disciplina Alegre',
    descripcion: 'Practicar la constancia en las tareas de forma divertida',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'trabajo',
    icono: '🎯'
  },

  // EMOCIONES
  {
    id: 'em1',
    titulo: 'Observar Emociones',
    descripcion: 'Notar qué emociones siento y darles nombres sin juzgarlas',
    duracion: 10,
    nivel: 'facil',
    modulo: 'emociones',
    icono: '👀'
  },
  {
    id: 'em2',
    titulo: 'Transformar Sentimientos',
    descripcion: 'Técnicas simples para cambiar emociones difíciles en positivas',
    duracion: 15,
    nivel: 'intermedio',
    modulo: 'emociones',
    icono: '🔄'
  },
  {
    id: 'em3',
    titulo: 'Inteligencia Emocional',
    descripcion: 'Juegos para entender mejor mis emociones y las de otros',
    duracion: 25,
    nivel: 'intermedio',
    modulo: 'emociones',
    icono: '🧠'
  },

  // RELACIONES
  {
    id: 'r1',
    titulo: 'Comunicación Empática',
    descripcion: 'Practicar escuchar con el corazón y hablar con bondad',
    duracion: 20,
    nivel: 'intermedio',
    modulo: 'relaciones',
    icono: '💬'
  },
  {
    id: 'r2',
    titulo: 'Juegos Cooperativos',
    descripcion: 'Actividades donde todos ganamos trabajando juntos',
    duracion: 30,
    nivel: 'facil',
    modulo: 'relaciones',
    icono: '🤝'
  },
  {
    id: 'r3',
    titulo: 'Cultivar Amistades',
    descripcion: 'Aprender a ser buen amigo y cuidar las relaciones importantes',
    duracion: 15,
    nivel: 'facil',
    modulo: 'relaciones',
    icono: '👯'
  }
];

export const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
export const franjasHorarias = ['mañana', 'media-mañana', 'tarde', 'noche'];