// src/components/admin/TemplateHtmlUploader.tsx
'use client';
import { useState, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/templates';

interface Props {
  onHtmlUploaded: (html: string) => void;
  existingHtml?: string;
}

export default function TemplateHtmlUploader({ onHtmlUploaded, existingHtml }: Props) {
  const [htmlContent, setHtmlContent] = useState(existingHtml || '');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'file' | 'editor'>('file');

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Solo se permiten archivos .html o .htm');
      return;
    }

    if (file.size > 500 * 1024) {
      setError('El archivo es muy grande. Máximo 500KB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      const sanitized = sanitizeHtml(raw);
      setHtmlContent(sanitized);
      onHtmlUploaded(sanitized);
    };
    reader.readAsText(file);
  }, [onHtmlUploaded]);

  const handleEditorChange = (value: string) => {
    setHtmlContent(value);
  };

  const handleApplyEditor = () => {
    if (!htmlContent.trim()) {
      setError('El contenido HTML no puede estar vacío');
      return;
    }

    if (htmlContent.length > 500 * 1024) {
      setError('El HTML es muy grande. Máximo 500KB.');
      return;
    }

    setError('');
    const sanitized = sanitizeHtml(htmlContent);
    setHtmlContent(sanitized);
    onHtmlUploaded(sanitized);
  };

  return (
    <div className="space-y-4">
      <label className="block text-gray-900 font-semibold mb-2">
        📄 Plantilla HTML
      </label>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            mode === 'file'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📁 Subir Archivo
        </button>
        <button
          type="button"
          onClick={() => setMode('editor')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            mode === 'editor'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✏️ Editor
        </button>
      </div>

      {mode === 'file' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-gray-50 transition">
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            className="hidden"
            id="html-upload"
          />
          <label htmlFor="html-upload" className="cursor-pointer">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-700 font-medium">
              Haz clic para seleccionar un archivo HTML
            </p>
            <p className="text-sm text-gray-500 mt-2">
              .html o .htm - Máximo 500KB
            </p>
          </label>
        </div>
      )}

      {mode === 'editor' && (
        <div className="space-y-3">
          <textarea
            value={htmlContent}
            onChange={(e) => handleEditorChange(e.target.value)}
            placeholder='<div style="text-align: center; padding: 40px;">
  <h1>{{titulo}}</h1>
  <h2>{{nombre}}</h2>
  <p>📅 {{fecha}} · 🕐 {{hora}}</p>
  <p>📍 {{lugar}}</p>
  <p>{{mensaje}}</p>
</div>'
            rows={15}
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-mono text-sm resize-y"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={handleApplyEditor}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            ✅ Aplicar HTML
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 font-medium text-sm">{error}</p>
      )}

      {htmlContent && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-semibold">Vista previa:</p>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={htmlContent}
              title="Vista previa HTML"
              className="w-full border-0"
              style={{ height: '400px' }}
              sandbox="allow-same-origin"
            />
          </div>
          <p className="text-xs text-gray-500">
            Tamaño: {(htmlContent.length / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 font-semibold text-sm mb-2">💡 Variables disponibles:</p>
        <div className="flex flex-wrap gap-2">
          {['{{titulo}}', '{{nombre}}', '{{fecha}}', '{{hora}}', '{{lugar}}', '{{mensaje}}', '{{versiculo}}'].map((v) => (
            <code key={v} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono">
              {v}
            </code>
          ))}
        </div>
        <p className="text-blue-600 text-xs mt-2">
          Estas variables se reemplazarán automáticamente con los datos del evento.
        </p>
      </div>
    </div>
  );
}
