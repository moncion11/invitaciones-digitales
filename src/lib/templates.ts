// src/lib/templates.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export interface TemplateField {
  x: number | string;
  y: number;
  fuente: string;
  tamaño: number;
  color: string;
  alineacion?: 'left' | 'center' | 'right';
}

export interface CustomTextField extends TemplateField {
  id: string;
  label: string;
  valor?: string;
  activo: boolean;
}

export interface TemplateButton {
  x: number | string;
  y: number;
  ancho: number;
  alto: number;
  texto: string;
  color: string;
  colorTexto: string;
  accion: 'rsvp' | 'gifts' | 'map' | 'calendar' | 'share';
}

export interface Plantilla {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precioSugerido?: number;
  imagenFondo: string;
  
  // Tipo de plantilla
  tipo?: 'imagen' | 'html';
  htmlContent?: string;
  
  // Dimensiones personalizadas
  anchoPlantilla?: number;
  altoPlantilla?: number;
  
  // Campos estándar
  campos: {
    titulo?: TemplateField;
    nombre?: TemplateField;
    fecha?: TemplateField;
    hora?: TemplateField;
    lugar?: TemplateField;
    mensaje?: TemplateField;
    versiculo?: TemplateField;
  };
  
  // Campos personalizados adicionales
  camposPersonalizados?: CustomTextField[];
  
  botones: {
    confirmar?: TemplateButton;
    regalos?: TemplateButton;
    mapa?: TemplateButton;
  };
  activa: boolean;
  fechaCreacion?: any;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function compressImage(file: File, maxWidth: number = 800, maxHeight: number = 1000): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }
      }, 'image/jpeg', 0.7);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export async function createPlantilla(plantilla: Plantilla): Promise<string> {
  const docRef = await addDoc(collection(db, 'plantillas'), {
    ...plantilla,
    fechaCreacion: new Date().toISOString(),
    activa: true,
  });
  return docRef.id;
}

export async function getPlantillas(): Promise<Plantilla[]> {
  const snapshot = await getDocs(collection(db, 'plantillas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plantilla));
}

export async function getPlantillaById(id: string): Promise<Plantilla | null> {
  const docRef = doc(db, 'plantillas', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Plantilla;
  }
  return null;
}

export async function updatePlantilla(id: string, data: Partial<Plantilla>): Promise<void> {
  const docRef = doc(db, 'plantillas', id);
  await updateDoc(docRef, data);
}

export async function deletePlantilla(id: string): Promise<void> {
  await deleteDoc(doc(db, 'plantillas', id));
}

export async function getPlantillasByCategoria(categoria: string): Promise<Plantilla[]> {
  const snapshot = await getDocs(collection(db, 'plantillas'));
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Plantilla))
    .filter(p => p.categoria === categoria && p.activa);
}

export function sanitizeHtml(html: string): string {
  // Lista de CDNs confiables permitidos
  const allowedCDNs = [
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://cdnjs.cloudflare.com',
    'https://maxcdn.bootstrapcdn.com',
    'https://stackpath.bootstrapcdn.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://code.jquery.com',
  ];

  // Paso 1: Extraer y preservar scripts externos de CDNs confiables
  const allowedScriptTags: string[] = [];
  let sanitized = html.replace(/<script\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>[\s\S]*?<\/script>/gi, (match, before, src, after) => {
    // Verificar si el src es de un CDN confiable
    const isAllowed = allowedCDNs.some(cdn => src.startsWith(cdn));
    if (isAllowed) {
      // Preservar este script
      const placeholder = `<!--ALLOWED_SCRIPT_${allowedScriptTags.length}-->`;
      allowedScriptTags.push(match);
      return placeholder;
    }
    // Eliminar scripts de fuentes no confiables
    return '';
  });

  // Paso 2: Preservar bloques de configuración de Tailwind
  const tailwindConfigs: string[] = [];
  sanitized = sanitized.replace(/<script\b[^>]*>([\s\S]*?tailwind\.config[\s\S]*?)<\/script>/gi, (match, content) => {
    // Solo permitir si es configuración pura (no tiene otras llamadas sospechosas)
    if (!content.match(/(fetch|XMLHttpRequest|eval|Function|document\.|window\.location)/i)) {
      const placeholder = `<!--TAILWIND_CONFIG_${tailwindConfigs.length}-->`;
      tailwindConfigs.push(match);
      return placeholder;
    }
    return '';
  });

  // Paso 3: Eliminar TODOS los demás scripts inline
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar event handlers inline
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*\S+/gi, '')
    // Eliminar javascript: URLs
    .replace(/javascript\s*:/gi, '')
    // Eliminar iframes, objects, embeds
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<\/embed>/gi, '');

  // Paso 4: Re-insertar scripts permitidos en sus posiciones originales
  allowedScriptTags.forEach((script, index) => {
    sanitized = sanitized.replace(`<!--ALLOWED_SCRIPT_${index}-->`, script);
  });

  tailwindConfigs.forEach((config, index) => {
    sanitized = sanitized.replace(`<!--TAILWIND_CONFIG_${index}-->`, config);
  });

  return sanitized;
}

export function replaceTemplateVariables(html: string, variables: Record<string, string>): string {
  // Variables that contain URLs should not be HTML-escaped
  const urlFields = new Set(['imagenPrincipal']);
  
  let result = html;

  // Process conditional blocks: {{#if variable}}...{{/if variable}}
  // Removes the entire block if the variable is empty/falsy, keeps content otherwise
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\s+\1\}\}/g,
    (_match, key, content) => {
      const value = variables[key];
      return value ? content : '';
    }
  );

  for (const [key, value] of Object.entries(variables)) {
    let replacementValue: string;
    if (urlFields.has(key)) {
      // For URL fields, only sanitize to prevent XSS but preserve URL structure
      replacementValue = value
        .replace(/javascript\s*:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      replacementValue = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacementValue);
  }
  // Remove any unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '');
  return result;
}

/**
 * Detecta si el HTML contiene elementos de countdown
 * Busca IDs, clases y atributos data comunes en templates de countdown
 */
export function detectCountdownElements(html: string): boolean {
  const countdownPatterns = [
    // IDs comunes
    /id=["']?(days|hours|minutes|seconds)["']?/i,
    /id=["']?countdown["']?/i,
    // Clases comunes
    /class=["'][^"']*countdown[^"']*["']/i,
    /class=["'][^"']*(days|hours|minutes|seconds)[^"']*["']/i,
    // Atributos data
    /data-countdown/i,
    /data-timer/i,
  ];
  
  return countdownPatterns.some(pattern => pattern.test(html));
}

/**
 * Inyecta un script seguro de countdown que actualiza elementos con IDs/clases estándar
 * El script lee la fecha del evento y actualiza los elementos automáticamente
 */
export function injectCountdownScript(html: string, eventDate: string, eventTime: string = '00:00'): string {
  // Si no hay fecha válida, no inyectar script
  if (!eventDate || eventDate === 'Por definir') {
    return html;
  }

  const countdownScript = `
<script>
(function() {
  // Parseamos la fecha del evento
  const eventDateStr = '${eventDate.replace(/'/g, "\\'")}';
  const eventTimeStr = '${eventTime.replace(/'/g, "\\'")}';
  
  // Intentar parsear diferentes formatos de fecha
  let eventDate;
  
  // Formato ISO (YYYY-MM-DD)
  if (eventDateStr.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
    eventDate = new Date(eventDateStr + 'T' + eventTimeStr + ':00');
  }
  // Formato DD/MM/YYYY o similar
  else {
    const parts = eventDateStr.split(/[\\/\\-.]/);
    if (parts.length === 3) {
      // Intentar DD/MM/YYYY
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Meses en JS son 0-indexed
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const [hours, minutes] = eventTimeStr.split(':').map(n => parseInt(n) || 0);
        eventDate = new Date(year, month, day, hours, minutes, 0);
      }
    }
  }
  
  // Si no se pudo parsear, intentar con Date.parse
  if (!eventDate || isNaN(eventDate.getTime())) {
    eventDate = new Date(eventDateStr + ' ' + eventTimeStr);
  }
  
  // Si aún no es válida, salir
  if (isNaN(eventDate.getTime())) {
    console.warn('No se pudo parsear la fecha del evento:', eventDateStr);
    return;
  }
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate.getTime() - now;
    
    if (distance < 0) {
      // El evento ya pasó
      ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
        const elements = [
          document.getElementById(unit),
          ...Array.from(document.getElementsByClassName('countdown-' + unit)),
          ...Array.from(document.querySelectorAll('[data-countdown="' + unit + '"]'))
        ].filter(Boolean);
        
        elements.forEach(el => {
          if (el) el.textContent = '00';
        });
      });
      return;
    }
    
    // Calcular tiempo restante
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const values = { days, hours, minutes, seconds };
    
    // Actualizar todos los elementos encontrados
    Object.entries(values).forEach(([unit, value]) => {
      const paddedValue = String(value).padStart(2, '0');
      
      // Buscar por ID
      const byId = document.getElementById(unit);
      if (byId) byId.textContent = paddedValue;
      
      // Buscar por clase
      const byClass = document.getElementsByClassName('countdown-' + unit);
      Array.from(byClass).forEach(el => el.textContent = paddedValue);
      
      // Buscar por atributo data
      const byData = document.querySelectorAll('[data-countdown="' + unit + '"]');
      Array.from(byData).forEach(el => el.textContent = paddedValue);
    });
  }
  
  // Actualizar inmediatamente y luego cada segundo
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
</script>
  `.trim();

  // Inyectar antes del cierre de </body> o al final si no hay body
  if (html.includes('</body>')) {
    return html.replace('</body>', countdownScript + '\n</body>');
  } else if (html.includes('</html>')) {
    return html.replace('</html>', countdownScript + '\n</html>');
  } else {
    return html + '\n' + countdownScript;
  }
}