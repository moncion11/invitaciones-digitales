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
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*\S+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<\/embed>/gi, '');
}

export function replaceTemplateVariables(html: string, variables: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    const escapedValue = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escapedValue);
  }
  // Remove any unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '');
  return result;
}