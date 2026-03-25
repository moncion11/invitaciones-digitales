// src/components/admin/TemplateUploader.tsx
'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { compressImage, fileToBase64 } from '@/lib/templates';

interface Props {
  onImageUploaded: (base64: string) => void;
  existingImage?: string;
}

export default function TemplateUploader({ onImageUploaded, existingImage }: Props) {
  const [preview, setPreview] = useState<string>(existingImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Verificar tamaño (máximo 2MB antes de comprimir)
      if (file.size > 2 * 1024 * 1024) {
        setError('❌ La imagen es muy grande. Máximo 2MB.');
        return;
      }

      setUploading(true);
      setError('');
      
      try {
        // Comprimir imagen
        const compressed = await compressImage(file);
        
        // Convertir a Base64
        const base64 = await fileToBase64(compressed);
        
        // Verificar tamaño final (<1MB para Firestore)
        if (base64.length > 1000000) {
          setError('❌ La imagen comprimida sigue siendo muy grande. Usa una imagen más pequeña.');
          return;
        }
        
        setPreview(base64);
        onImageUploaded(base64);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('❌ Error al procesar la imagen');
      } finally {
        setUploading(false);
      }
    }
  }, [onImageUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB máximo
  });

  return (
    <div className="space-y-4">
      <label className="block text-gray-900 font-semibold mb-2">
        📤 Imagen de Fondo *
      </label>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        } ${error ? 'border-red-400 bg-red-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">
              ✅ Imagen cargada. Haz clic para cambiar.
            </p>
            <p className="text-xs text-gray-500">
              Tamaño: {(preview.length / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📤</div>
            {isDragActive ? (
              <p className="text-purple-600 font-medium">
                Suelta la imagen aquí...
              </p>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">
                  Arrastra tu imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG • Máximo 2MB • Recomendado: 800x1000px
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {uploading && (
        <div className="text-center text-purple-600">
          <div className="animate-spin text-2xl">⏳</div>
          <p className="text-sm">Procesando imagen...</p>
        </div>
      )}
    </div>
  );
}