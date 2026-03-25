// src/lib/excelUtils.ts
import * as XLSX from 'xlsx';

export interface GuestImport {
  nombre: string;
  email?: string;
  telefono?: string;
  familia?: string;
  
}

export interface GiftImport {
  nombre: string;
  precio?: string;
  stock: number;
  imagen?: string;
  ilimitado?: boolean;
  orden?: number;
}

/**
 * Lee un archivo Excel y retorna los datos como array de objetos
 */
export function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Leer primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

/**
 * Valida y convierte datos para invitados
 */
export function parseGuestsData(data: any[]): GuestImport[] {
  return data.map((row: any, index: number) => {
    // Buscar columnas con nombres similares
    const nombre = row.nombre || row.Nombre || row.NOMBRE || row['Nombre del Invitado'] || `Invitado ${index + 1}`;
    const email = row.email || row.Email || row.EMAIL || row.Correo || '';
    const telefono = row.telefono || row.Telefono || row.TELEFONO || row.Whatsapp || '';
    const familia = row.familia || row.Familia || row.Gruppo || '';
    
    return {
      nombre: nombre.trim(),
      email: email?.trim() || '',
      telefono: telefono?.trim() || '',
      familia: familia?.trim() || '',
    };
  }).filter(g => g.nombre && g.nombre !== 'Invitado');
}

/**
 * Valida y convierte datos para regalos
 */
export function parseGiftsData(data: any[]): GiftImport[] {
  return data
    .map((row: any, index: number) => {
      const nombre = row.nombre || row.Nombre || row.NOMBRE || row['Nombre del Regalo'] || `Regalo ${index + 1}`;
      const precio = row.precio || row.Precio || row.PRECIO || '$0';
      const stock = parseInt(row.stock || row.Stock || row.STOCK || row.cantidad || row.Cantidad || '1');
      const imagen = row.imagen || row.Imagen || row.EMOJI || row.emoji || '🎁';
      
      const ilimitado = row.ilimitado === 'SI' || row.Ilimitado === 'SI' || row.ilimitado === true;

      return {
        nombre: nombre.trim(),
        precio: precio?.toString() || '$0',
        stock: isNaN(stock) ? 1 : stock,
        imagen: imagen?.trim() || '🎁',
        ilimitado,
        orden: index, // ✅ Guardar orden original
      };
    })
    .filter(g => g.nombre && g.nombre !== 'Regalo sin nombre' && !g.nombre.startsWith('Regalo '));
}
/**
 * Genera plantilla Excel para invitados
 */
export function downloadGuestsTemplate() {
  const data = [
    { nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '829-123-4567', familia: 'Familia Pérez' },
    { nombre: 'María González', email: 'maria@email.com', telefono: '829-234-5678', familia: '' },
    { nombre: 'Carlos Rodríguez', email: '', telefono: '829-345-6789', familia: 'Familia Rodríguez' },
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
  
  XLSX.writeFile(workbook, 'Plantilla_Invitados.xlsx');
}

/**
 * Genera plantilla Excel para regalos
 */
export function downloadGiftsTemplate() {
  const data = [
    { nombre: 'Juego de Sábanas', precio: '$150', stock: 2, imagen: '🛏️', ilimitado: 'NO' },
    { nombre: 'Pañales Etapa 1', precio: '$50', stock: 999, imagen: '👶', ilimitado: 'SI' },
    { nombre: 'Sterilizador', precio: '$200', stock: 1, imagen: '🍼', ilimitado: 'NO' },
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Regalos');
  
  XLSX.writeFile(workbook, 'Plantilla_Regalos.xlsx');
}