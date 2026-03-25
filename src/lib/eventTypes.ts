// src/lib/eventTypes.ts

export interface EventType {
  id: string;
  nombre: string;
  icono: string;
  categoria: string;
  textos: {
    titulo: string;
    subtitulo: string;
    bienvenida: string;
  };
  coloresRecomendados: string[];
  caracteristicasEspeciales: string[];
  camposPersonalizados?: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea';
    required: boolean;
    placeholder?: string;
  }[];
}

export const tiposEvento: EventType[] = [
  // ==================== BABY ====================
  {
    id: 'baby-shower',
    nombre: 'Baby Shower',
    icono: '👶',
    categoria: 'baby',
    textos: {
      titulo: '¡Baby Shower!',
      subtitulo: 'Estás invitado a celebrar la llegada de',
      bienvenida: 'y su pequeño tesoro',
    },
    coloresRecomendados: ['rosa-clasico', 'azul-bebe', 'arcoiris'],
    caracteristicasEspeciales: ['Lista de regalos', 'Confirmación de asistencia', 'Diseño temático'],
    camposPersonalizados: [
      { id: 'genero', label: 'Género del Bebé', type: 'text', required: false, placeholder: 'Ej: Niño, Niña, Sorpresa' },
      { id: 'fechaProbable', label: 'Fecha Probable de Parto', type: 'date', required: false, placeholder: '' },
    ],
  },
  {
    id: 'baby-reveal',
    nombre: 'Baby Reveal',
    icono: '❓',
    categoria: 'baby',
    textos: {
      titulo: '¡Baby Reveal!',
      subtitulo: 'Acompáñanos a descubrir el género de',
      bienvenida: 'nuestro bebé',
    },
    coloresRecomendados: ['arcoiris', 'morado-magico'],
    caracteristicasEspeciales: ['Revelación de género', 'Actividades especiales', 'Votación de género'],
    camposPersonalizados: [
      { id: 'fechaRevelacion', label: 'Fecha del Revelado', type: 'date', required: false, placeholder: '' },
    ],
  },
  {
    id: 'bautizo',
    nombre: 'Bautizo',
    icono: '⛪',
    categoria: 'baby',
    textos: {
      titulo: '¡Bautizo!',
      subtitulo: 'Estás invitado al bautizo de',
      bienvenida: 'que recibe la bendición de Dios',
    },
    coloresRecomendados: ['dorado-lujo', 'azul-bebe', 'blanco'],
    caracteristicasEspeciales: ['Ceremonia religiosa', 'Padrinos', 'Recepción'],
    camposPersonalizados: [
      { id: 'iglesia', label: 'Iglesia', type: 'text', required: false, placeholder: 'Nombre de la iglesia' },
      { id: 'horaCeremonia', label: 'Hora de la Ceremonia', type: 'text', required: false, placeholder: 'Ej: 10:00 AM' },
    ],
  },

  // ==================== CUMPLEAÑOS ====================
  {
    id: 'cumpleanos-ninos',
    nombre: 'Cumpleaños Niños',
    icono: '🎂',
    categoria: 'cumpleanos',
    textos: {
      titulo: '¡Feliz Cumpleaños!',
      subtitulo: 'Estás invitado a celebrar los',
      bienvenida: 'años de',
    },
    coloresRecomendados: ['arcoiris', 'rosa-clasico', 'azul-bebe'],
    caracteristicasEspeciales: ['Edad personalizada', 'Tema de fiesta', 'Actividades para niños', 'Regalos'],
    camposPersonalizados: [
      { id: 'edad', label: 'Edad que Cumple', type: 'number', required: true, placeholder: 'Ej: 5' },
      { id: 'temaFiesta', label: 'Tema de la Fiesta', type: 'text', required: false, placeholder: 'Ej: Superhéroes, Princesas, Animales' },
      { id: 'actividades', label: 'Actividades Especiales', type: 'textarea', required: false, placeholder: 'Ej: Piñata, Juegos, Payaso' },
    ],
  },
  {
    id: 'cumpleanos-adultos',
    nombre: 'Cumpleaños Adultos',
    icono: '🍷',
    categoria: 'cumpleanos',
    textos: {
      titulo: '¡Fiesta de Cumpleaños!',
      subtitulo: 'Celebra conmigo un año más de vida',
      bienvenida: 'de',
    },
    coloresRecomendados: ['dorado-lujo', 'morado-magico', 'verde-natural'],
    caracteristicasEspeciales: ['Código de vestimenta', 'Bar/Comida', 'Música en vivo', 'Regalos'],
    camposPersonalizados: [
      { id: 'edad', label: 'Edad que Cumple', type: 'number', required: false, placeholder: 'Ej: 30' },
      { id: 'dressCode', label: 'Código de Vestimenta', type: 'text', required: false, placeholder: 'Ej: Casual, Formal, Elegante' },
      { id: 'rsvp', label: 'Fecha Límite RSVP', type: 'date', required: false, placeholder: '' },
    ],
  },
  {
    id: '15-anos',
    nombre: '15 Años',
    icono: '👑',
    categoria: '15-anos',
    textos: {
      titulo: '¡Mis 15 Años!',
      subtitulo: 'Estás invitado a la fiesta de',
      bienvenida: 'celebrando sus 15 primaveras',
    },
    coloresRecomendados: ['morado-magico', 'rosa-clasico', 'dorado-lujo'],
    caracteristicasEspeciales: ['Corte de vals', 'Damas y Chambelanes', 'Vestido de quinceañera', 'Brindis', 'Regalos'],
    camposPersonalizados: [
      { id: 'nombreQuinceanera', label: 'Nombre de la Quinceañera', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'padres', label: 'Nombres de los Padres', type: 'text', required: false, placeholder: 'Ej: Juan y María Pérez' },
      { id: 'misa', label: 'Misa de Acción de Gracias', type: 'text', required: false, placeholder: 'Iglesia y hora' },
      { id: 'recepcion', label: 'Recepción', type: 'text', required: false, placeholder: 'Lugar de la fiesta' },
    ],
  },

  // ==================== BODAS ====================
  {
    id: 'boda',
    nombre: 'Boda',
    icono: '💒',
    categoria: 'bodas',
    textos: {
      titulo: '¡Nuestra Boda!',
      subtitulo: 'Acompáñanos a celebrar nuestra unión',
      bienvenida: 'de',
    },
    coloresRecomendados: ['dorado-lujo', 'rosa-clasico', 'blanco', 'verde-natural'],
    caracteristicasEspeciales: ['Nombres de los novios', 'Ceremonia y recepción', 'Mesa de regalos', 'Cuenta regresiva', 'Código de vestimenta', 'Mapa del venue'],
    camposPersonalizados: [
      { id: 'novioNombre', label: 'Nombre del Novio', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'noviaNombre', label: 'Nombre de la Novia', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'iglesia', label: 'Iglesia/Ceremonia', type: 'text', required: false, placeholder: 'Nombre y dirección' },
      { id: 'recepcion', label: 'Recepción', type: 'text', required: false, placeholder: 'Lugar de la recepción' },
      { id: 'dressCode', label: 'Código de Vestimenta', type: 'text', required: false, placeholder: 'Ej: Formal, Etiqueta, Casual' },
      { id: 'mesaRegalos', label: 'Mesa de Regalos', type: 'textarea', required: false, placeholder: 'Información de la mesa de regalos' },
    ],
  },
  {
    id: 'bridal-shower',
    nombre: 'Bridal Shower',
    icono: '👰',
    categoria: 'bodas',
    textos: {
      titulo: '¡Bridal Shower!',
      subtitulo: 'Estás invitado a celebrar a la novia',
      bienvenida: 'antes de su gran día',
    },
    coloresRecomendados: ['rosa-clasico', 'morado-magico'],
    caracteristicasEspeciales: ['Juegos de novia', 'Regalos personalizados', 'Brindis'],
    camposPersonalizados: [
      { id: 'noviaNombre', label: 'Nombre de la Novia', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'organizadora', label: 'Organizado Por', type: 'text', required: false, placeholder: 'Ej: Damas de honor' },
    ],
  },
  {
    id: 'aniversario',
    nombre: 'Aniversario',
    icono: '💕',
    categoria: 'bodas',
    textos: {
      titulo: '¡Aniversario!',
      subtitulo: 'Celebra con nosotros nuestro',
      bienvenida: 'aniversario de bodas',
    },
    coloresRecomendados: ['dorado-lujo', 'rosa-clasico'],
    caracteristicasEspeciales: ['Años de matrimonio', 'Votos de renovación', 'Fiesta de aniversario'],
    camposPersonalizados: [
      { id: 'anios', label: 'Años de Matrimonio', type: 'number', required: true, placeholder: 'Ej: 25' },
      { id: 'parejaNombres', label: 'Nombres de la Pareja', type: 'text', required: true, placeholder: 'Ej: Juan y María' },
    ],
  },

  // ==================== GRADUACIÓN ====================
  {
    id: 'graduacion',
    nombre: 'Graduación',
    icono: '🎓',
    categoria: 'graduacion',
    textos: {
      titulo: '¡Graduación!',
      subtitulo: 'Celebra este logro con',
      bienvenida: 'que se gradúa de',
    },
    coloresRecomendados: ['azul-bebe', 'dorado-lujo'],
    caracteristicasEspeciales: ['Universidad/Institución', 'Carrera', 'Año de graduación', 'Logros académicos'],
    camposPersonalizados: [
      { id: 'graduadoNombre', label: 'Nombre del Graduado', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'institucion', label: 'Institución', type: 'text', required: true, placeholder: 'Ej: Universidad Autónoma' },
      { id: 'carrera', label: 'Carrera/Programa', type: 'text', required: true, placeholder: 'Ej: Medicina, Ingeniería' },
      { id: 'anioGraduacion', label: 'Año de Graduación', type: 'number', required: true, placeholder: 'Ej: 2024' },
    ],
  },

  // ==================== OTROS ====================
  {
    id: 'despedida',
    nombre: 'Despedida',
    icono: '🎉',
    categoria: 'otros',
    textos: {
      titulo: '¡Despedida!',
      subtitulo: 'Acompáñanos a despedir',
      bienvenida: 'en esta fiesta especial',
    },
    coloresRecomendados: ['arcoiris', 'morado-magico'],
    caracteristicasEspeciales: ['Tema de despedida', 'Actividades', 'Regalos'],
    camposPersonalizados: [
      { id: 'homenajeado', label: 'Persona Homenajeada', type: 'text', required: true, placeholder: 'Nombre' },
      { id: 'tipoDespedida', label: 'Tipo de Despedida', type: 'text', required: false, placeholder: 'Ej: Soltero, Viaje, Jubilación' },
    ],
  },
  {
    id: 'corporativo',
    nombre: 'Corporativo',
    icono: '🏢',
    categoria: 'corporativo',
    textos: {
      titulo: 'Evento Corporativo',
      subtitulo: 'Estás invitado al evento de',
      bienvenida: 'organizado por',
    },
    coloresRecomendados: ['dorado-lujo', 'azul-bebe', 'verde-natural'],
    caracteristicasEspeciales: ['Logo de empresa', 'Agenda del evento', 'Dress code', 'Networking'],
    camposPersonalizados: [
      { id: 'empresa', label: 'Nombre de la Empresa', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'tipoEvento', label: 'Tipo de Evento', type: 'text', required: false, placeholder: 'Ej: Navidad, Lanzamiento, Conferencia' },
      { id: 'agenda', label: 'Agenda', type: 'textarea', required: false, placeholder: 'Programa del evento' },
    ],
  },
  {
    id: 'navidad',
    nombre: 'Navidad',
    icono: '🎄',
    categoria: 'otros',
    textos: {
      titulo: '¡Fiesta de Navidad!',
      subtitulo: 'Celebra la navidad con',
      bienvenida: 'en esta fecha especial',
    },
    coloresRecomendados: ['arcoiris', 'verde-natural', 'rojo'],
    caracteristicasEspeciales: ['Intercambio de regalos', 'Cena navideña', 'Actividades festivas'],
    camposPersonalizados: [
      { id: 'organizador', label: 'Organizado Por', type: 'text', required: false, placeholder: 'Ej: Familia, Empresa' },
      { id: 'actividades', label: 'Actividades', type: 'textarea', required: false, placeholder: 'Ej: Cena, Intercambio, Villancicos' },
    ],
  },
  {
    id: 'memorial',
    nombre: 'Memorial',
    icono: '🕊️',
    categoria: 'otros',
    textos: {
      titulo: 'Homenaje',
      subtitulo: 'Recordamos con amor a',
      bienvenida: 'en este homenaje especial',
    },
    coloresRecomendados: ['verde-natural', 'blanco'],
    caracteristicasEspeciales: ['Homenaje póstumo', 'Galería de recuerdos', 'Mensaje de condolencia'],
    camposPersonalizados: [
      { id: 'homenajeado', label: 'Nombre del Homenajeado', type: 'text', required: true, placeholder: 'Nombre completo' },
      { id: 'fechas', label: 'Fechas', type: 'text', required: false, placeholder: 'Ej: 1950 - 2024' },
      { id: 'mensaje', label: 'Mensaje', type: 'textarea', required: false, placeholder: 'Mensaje de recuerdo' },
    ],
  },
  {
    id: 'otro',
    nombre: 'Otro Evento',
    icono: '✨',
    categoria: 'otros',
    textos: {
      titulo: '¡Evento Especial!',
      subtitulo: 'Estás invitado a celebrar con',
      bienvenida: 'este momento único',
    },
    coloresRecomendados: ['arcoiris', 'morado-magico'],
    caracteristicasEspeciales: ['Personalizable', 'Flexible'],
    camposPersonalizados: [],
  },
];

export function getTextosPorDefecto(tipoEventoId: string) {
  const evento = tiposEvento.find(e => e.id === tipoEventoId);
  return evento ? evento.textos : tiposEvento[0].textos;
}

export function getCaracteristicasEspeciales(tipoEventoId: string) {
  const evento = tiposEvento.find(e => e.id === tipoEventoId);
  return evento ? evento.caracteristicasEspeciales : [];
}

export function getCamposPersonalizados(tipoEventoId: string) {
  const evento = tiposEvento.find(e => e.id === tipoEventoId);
  return evento ? evento.camposPersonalizados || [] : [];
}

export function getCategorias() {
  const categorias = [...new Set(tiposEvento.map(e => e.categoria))];
  return categorias.map(cat => ({
    id: cat,
    nombre: cat.charAt(0).toUpperCase() + cat.slice(1),
    icono: getIconoCategoria(cat),
  }));
}

function getIconoCategoria(categoria: string): string {
  const iconos: Record<string, string> = {
    'baby': '👶',
    'cumpleanos': '🎂',
    'bodas': '💒',
    '15-anos': '👑',
    'graduacion': '🎓',
    'corporativo': '🏢',
    'otros': '🎊',
  };
  return iconos[categoria] || '✨';
}