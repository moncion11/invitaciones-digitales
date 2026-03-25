// src/components/ImportGifts.tsx
'use client';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { readExcelFile, parseGiftsData, downloadGiftsTemplate } from '@/lib/excelUtils';

interface Props {
  eventId: string;
  onImportComplete: () => void;
  onClose: () => void;
}

export default function ImportGifts({ eventId, onImportComplete, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('❌ Formato no válido. Usa .xlsx, .xls o .csv');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');

    try {
      const data = await readExcelFile(selectedFile);
      const gifts = parseGiftsData(data);
      setPreview(gifts);
      
      if (gifts.length === 0) {
        setError('⚠️ No se encontraron regalos válidos en el archivo');
      }
    } catch (err) {
      setError('❌ Error al leer el archivo: ' + (err as Error).message);
    }
  };

  const handleImport = async () => {
  if (!file || preview.length === 0) return;

  setImporting(true);
  setError('');
  setSuccess('');

  try {
    let imported = 0;

    for (const gift of preview) {
      try {
        await addDoc(collection(db, 'eventos', eventId, 'regalos'), {
          nombre: gift.nombre,
          precio: '',  // ✅ Eliminar precio (vacío)
          stock: gift.stock,
          imagen: gift.imagen || '🎁',
          disponible: gift.stock > 0,
          ilimitado: gift.ilimitado || false,
          orden: gift.orden || 0,  // ✅ Guardar orden
        });
        imported++;
      } catch (err) {
        console.error('Error importing gift:', gift.nombre, err);
      }
    }

    setSuccess(`✅ ${imported} regalos importados exitosamente`);
    
    setTimeout(() => {
      onImportComplete();
      onClose();
    }, 2000);

  } catch (err) {
    setError('❌ Error al importar: ' + (err as Error).message);
  } finally {
    setImporting(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎁 Importar Regalos desde Excel</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1">📋 ¿Primera vez?</p>
              <p className="text-sm text-blue-700">Descarga nuestra plantilla para ver el formato correcto</p>
            </div>
            <button
              onClick={downloadGiftsTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              📥 Descargar Plantilla
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-900 font-semibold mb-2">
            1. Selecciona tu archivo Excel
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-gifts"
            />
            <label htmlFor="file-upload-gifts" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              {file ? (
                <div>
                  <p className="font-semibold text-purple-600">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700">Haz clic para seleccionar o arrastra tu archivo aquí</p>
                  <p className="text-sm text-gray-500 mt-1">Formatos: .xlsx, .xls, .csv</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {preview.length > 0 && (
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">
              2. Vista Previa ({preview.length} regalos)
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">#</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Nombre</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Precio</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Stock</th>
                  </tr>
                </thead>
                {/* En el tbody de la tabla de vista previa */}
<tbody>
  {preview.slice(0, 10).map((gift, index) => (
    <tr key={index} className="border-t border-gray-100">
      <td className="px-4 py-2 text-gray-600">{index + 1}</td>
      <td className="px-4 py-2 text-gray-900 font-medium">{gift.nombre}</td>
      <td className="px-4 py-2 text-gray-600">{gift.precio}</td>
      <td className="px-4 py-2 text-gray-600">
        {gift.ilimitado ? '♾️ Ilimitado' : gift.stock}
      </td>
    </tr>
  ))}
</tbody>
              </table>
              {preview.length > 10 && (
                <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-600">
                  ... y {preview.length - 10} regalos más
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? '⏳ Importando...' : `📥 Importar ${preview.length} Regalos`}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
  <p className="font-semibold mb-2">📝 Columnas requeridas:</p>
  <ul className="list-disc list-inside space-y-1">
    <li><strong>nombre</strong> - Nombre del regalo (requerido)</li>
    <li><strong>stock</strong> - Cantidad disponible (requerido, ej: 1, 2, 3...)</li>
    <li><strong>imagen</strong> - Emoji o ícono (opcional, default: 🎁)</li>
    <li><strong>ilimitado</strong> - SI/NO (opcional, default: NO)</li>
  </ul>
  <p className="mt-3 text-sm text-blue-700 font-medium">
    💡 Si pones <strong>ilimitado: NO</strong>, se mostrará el stock exacto que indiques
  </p>

        </div>
      </div>
    </div>
  );
}