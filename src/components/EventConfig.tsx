// src/components/EventConfig.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { tiposEvento, getTextosPorDefecto } from '@/lib/eventTypes';
import { useModal } from './Modal';

function ImagenPrincipalUploader({ value, onChange, eventId }: { value: string; onChange: (url: string) => void; eventId: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `eventos/${eventId}/imagen-principal-${Date.now()}.${ext}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen. Verifica los permisos de Storage.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-200">
      <label className="block text-gray-900 font-semibold mb-2">
        📸 Imagen Principal
      </label>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !eventId}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '⏳ Subiendo...' : '📤 Subir Imagen'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O pega una URL directamente: https://..."
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-400"
      />

      <p className="text-sm text-gray-500 mt-1">
        💡 Sube una imagen o pega una URL. Usa <code className="bg-gray-100 px-1 rounded">{'{{imagenPrincipal}}'}</code> en tu plantilla HTML.
      </p>

      {error && (
        <p className="text-sm text-red-600 mt-2">❌ {error}</p>
      )}

      {value && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
          <div className="relative inline-block">
            <img
              src={value}
              alt="Vista previa"
              className="max-h-40 rounded-lg border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  eventId: string | null;
  eventName?: string;
  configuracion?: any;
  onConfigChange?: (config: any) => void;
}

export default function EventConfig({ eventId, eventName, configuracion, onConfigChange }: Props) {
  const { showAlert } = useModal();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('');
  const [mapaUrl, setMapaUrl] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Tipo de evento
  const [tipoEvento, setTipoEvento] = useState('baby-shower');
  
  // Textos personalizables
  const [tituloPrincipal, setTituloPrincipal] = useState('¡Baby Shower!');
  const [subtitulo, setSubtitulo] = useState('Estás invitado a celebrar la llegada de');
  const [mensajeBienvenida, setMensajeBienvenida] = useState('y su pequeño tesoro');
  
  // Configuración personalizada por evento
  const [configPersonalizada, setConfigPersonalizada] = useState<any>({});
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchConfig();
    }
  }, [eventId]);

  useEffect(() => {
    if (configuracion) {
      setFecha(configuracion.fecha || '');
      setHora(configuracion.hora || '');
      setLugar(configuracion.lugar || '');
      setMapaUrl(configuracion.mapaUrl || '');
      setMensaje(configuracion.mensaje || '');
      setConfigPersonalizada(configuracion.personalizada || {});
    }
  }, [configuracion]);

  const fetchConfig = async () => {
    if (!eventId) return;
    
    try {
      const docRef = doc(db, 'eventos', eventId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const config = data.configuracion || {};
        setFecha(config.fecha || '');
        setHora(config.hora || '');
        setLugar(config.lugar || '');
        setMapaUrl(config.mapaUrl || '');
        setMensaje(config.mensaje || '');
        
        // Cargar tipo de evento
        setTipoEvento(data.tipoEvento || 'baby-shower');
        
        // Cargar textos personalizados
        setTituloPrincipal(data.tituloPrincipal || '¡Baby Shower!');
        setSubtitulo(data.subtitulo || 'Estás invitado a celebrar la llegada de');
        setMensajeBienvenida(data.mensajeBienvenida || 'y su pequeño tesoro');
        
        // Cargar configuración personalizada
        setConfigPersonalizada(config.personalizada || {});
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSaveAll = async () => {
    if (!eventId) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'eventos', eventId);
      await updateDoc(docRef, {
        tipoEvento,
        tituloPrincipal,
        subtitulo,
        mensajeBienvenida,
        configuracion: {
          fecha,
          hora,
          lugar,
          mapaUrl,
          mensaje,
          personalizada: configPersonalizada,
        },
      });
      
      if (onConfigChange) {
        onConfigChange({
          fecha,
          hora,
          lugar,
          mapaUrl,
          mensaje,
          personalizada: configPersonalizada,
        });
      }
      
      showAlert('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error saving config:', error);
      showAlert('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigPersonalizadaChange = (campo: string, valor: string) => {
    setConfigPersonalizada({ ...configPersonalizada, [campo]: valor });
  };

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">⚙️</p>
        <p className="text-gray-900 text-lg font-medium">Selecciona un evento para configurar</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">⚙️ Configuración del Evento</h2>

      {/* Tipo de Evento */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-gray-900 font-semibold mb-2">🎯 Tipo de Evento</label>
        <select
          value={tipoEvento}
          onChange={(e) => {
            setTipoEvento(e.target.value);
            const textos = getTextosPorDefecto(e.target.value);
            setTituloPrincipal(textos.titulo);
            setSubtitulo(textos.subtitulo);
            setMensajeBienvenida(textos.bienvenida);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
        >
          {tiposEvento.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.icono} {tipo.nombre}</option>
          ))}
        </select>
      </div>

      {/* Row: Info + Textos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Información del Evento */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">📅 Información del Evento</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Lugar</label>
            <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Salón de Eventos, Av. Principal #123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Link de Ubicación</label>
            <div className="flex gap-2">
              <input type="url" value={mapaUrl} onChange={(e) => setMapaUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400" />
              <button type="button"
                onClick={() => {
                  if (!lugar) { showAlert('Primero escribe la dirección del lugar', 'warning'); return; }
                  setMapaUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`);
                  showAlert('Link generado', 'success');
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap">
                📍 Generar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Mensaje Personalizado</label>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={2}
              placeholder="Ej: Nos haría muy feliz contar con tu presencia..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 text-sm placeholder-gray-400" />
          </div>
        </div>

        {/* Textos de la Invitación */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">✏️ Textos de la Invitación</h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Título Principal</label>
            <input type="text" value={tituloPrincipal} onChange={(e) => setTituloPrincipal(e.target.value)}
              placeholder="Ej: ¡Baby Shower!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400" />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Subtítulo</label>
            <input type="text" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Ej: Estás invitado a celebrar la llegada de"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400" />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Mensaje de Bienvenida</label>
            <input type="text" value={mensajeBienvenida} onChange={(e) => setMensajeBienvenida(e.target.value)}
              placeholder="Ej: y su pequeño tesoro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm placeholder-gray-400" />
          </div>

          {/* Imagen Principal */}
          <ImagenPrincipalUploader
            value={configPersonalizada?.imagenPrincipal || ''}
            onChange={(url) => handleConfigPersonalizadaChange('imagenPrincipal', url)}
            eventId={eventId}
          />
        </div>
      </div>

      {/* Campos Personalizados por Tipo de Evento */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">📝 Campos Personalizados</h3>
        <p className="text-gray-500 text-xs">Campos específicos para el tipo de evento seleccionado</p>

        {/* Cumpleaños Niños */}
        {tipoEvento === 'cumpleanos-ninos' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Edad que Cumple *
              </label>
              <input
                type="number"
                value={configPersonalizada?.edad || ''}
                onChange={(e) => handleConfigPersonalizadaChange('edad', e.target.value)}
                placeholder="Ej: 5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Tema de la Fiesta
              </label>
              <input
                type="text"
                value={configPersonalizada?.temaFiesta || ''}
                onChange={(e) => handleConfigPersonalizadaChange('temaFiesta', e.target.value)}
                placeholder="Ej: Superhéroes, Princesas, Animales"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Actividades Especiales
              </label>
              <textarea
                value={configPersonalizada?.actividades || ''}
                onChange={(e) => handleConfigPersonalizadaChange('actividades', e.target.value)}
                placeholder="Ej: Piñata, Juegos, Payaso"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* Cumpleaños Adultos */}
        {tipoEvento === 'cumpleanos-adultos' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Edad que Cumple
              </label>
              <input
                type="number"
                value={configPersonalizada?.edad || ''}
                onChange={(e) => handleConfigPersonalizadaChange('edad', e.target.value)}
                placeholder="Ej: 30"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Código de Vestimenta
              </label>
              <input
                type="text"
                value={configPersonalizada?.dressCode || ''}
                onChange={(e) => handleConfigPersonalizadaChange('dressCode', e.target.value)}
                placeholder="Ej: Casual, Formal, Elegante"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        )}

        {/* 15 Años */}
        {tipoEvento === '15-anos' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombre de la Quinceañera *
              </label>
              <input
                type="text"
                value={configPersonalizada?.nombreQuinceanera || ''}
                onChange={(e) => handleConfigPersonalizadaChange('nombreQuinceanera', e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombres de los Padres
              </label>
              <input
                type="text"
                value={configPersonalizada?.padres || ''}
                onChange={(e) => handleConfigPersonalizadaChange('padres', e.target.value)}
                placeholder="Ej: Juan y María Pérez"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Misa de Acción de Gracias
              </label>
              <input
                type="text"
                value={configPersonalizada?.misa || ''}
                onChange={(e) => handleConfigPersonalizadaChange('misa', e.target.value)}
                placeholder="Iglesia y hora"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Recepción
              </label>
              <input
                type="text"
                value={configPersonalizada?.recepcion || ''}
                onChange={(e) => handleConfigPersonalizadaChange('recepcion', e.target.value)}
                placeholder="Lugar de la fiesta"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Boda */}
        {tipoEvento === 'boda' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Nombre del Novio *
                </label>
                <input
                  type="text"
                  value={configPersonalizada?.novioNombre || ''}
                  onChange={(e) => handleConfigPersonalizadaChange('novioNombre', e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Nombre de la Novia *
                </label>
                <input
                  type="text"
                  value={configPersonalizada?.noviaNombre || ''}
                  onChange={(e) => handleConfigPersonalizadaChange('noviaNombre', e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Iglesia/Ceremonia
              </label>
              <input
                type="text"
                value={configPersonalizada?.iglesia || ''}
                onChange={(e) => handleConfigPersonalizadaChange('iglesia', e.target.value)}
                placeholder="Nombre y dirección de la iglesia"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Recepción
              </label>
              <input
                type="text"
                value={configPersonalizada?.recepcion || ''}
                onChange={(e) => handleConfigPersonalizadaChange('recepcion', e.target.value)}
                placeholder="Lugar de la recepción"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Código de Vestimenta
              </label>
              <input
                type="text"
                value={configPersonalizada?.dressCode || ''}
                onChange={(e) => handleConfigPersonalizadaChange('dressCode', e.target.value)}
                placeholder="Ej: Formal, Etiqueta, Casual"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Mesa de Regalos
              </label>
              <textarea
                value={configPersonalizada?.mesaRegalos || ''}
                onChange={(e) => handleConfigPersonalizadaChange('mesaRegalos', e.target.value)}
                placeholder="Información de la mesa de regalos"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* Graduación */}
        {tipoEvento === 'graduacion' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombre del Graduado *
              </label>
              <input
                type="text"
                value={configPersonalizada?.graduadoNombre || ''}
                onChange={(e) => handleConfigPersonalizadaChange('graduadoNombre', e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Institución *
                </label>
                <input
                  type="text"
                  value={configPersonalizada?.institucion || ''}
                  onChange={(e) => handleConfigPersonalizadaChange('institucion', e.target.value)}
                  placeholder="Ej: Universidad Autónoma"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Carrera *
                </label>
                <input
                  type="text"
                  value={configPersonalizada?.carrera || ''}
                  onChange={(e) => handleConfigPersonalizadaChange('carrera', e.target.value)}
                  placeholder="Ej: Medicina"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Año de Graduación
              </label>
              <input
                type="number"
                value={configPersonalizada?.anioGraduacion || ''}
                onChange={(e) => handleConfigPersonalizadaChange('anioGraduacion', e.target.value)}
                placeholder="Ej: 2024"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Baby Shower */}
        {tipoEvento === 'baby-shower' && (
  <div className="space-y-4">
    <div>
      <label className="block text-gray-900 font-semibold mb-2">
        Nombre del Bebé
      </label>
      <input
        type="text"
        value={configPersonalizada?.nombreBebe || ''}
        onChange={(e) => handleConfigPersonalizadaChange('nombreBebe', e.target.value)}
        placeholder="Ej: Hermione"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
    </div>
    
    <div>
      <label className="block text-gray-900 font-semibold mb-2">
        Nombres de los Padres
      </label>
      <input
        type="text"
        value={configPersonalizada?.padres || ''}
        onChange={(e) => handleConfigPersonalizadaChange('padres', e.target.value)}
        placeholder="Ej: Juan y María Pérez"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
    </div>
    
    <div>
      <label className="block text-gray-900 font-semibold mb-2">
        Género del Bebé
      </label>
      <input
        type="text"
        value={configPersonalizada?.genero || ''}
        onChange={(e) => handleConfigPersonalizadaChange('genero', e.target.value)}
        placeholder="Ej: Niña, Niño, Sorpresa"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
    </div>

    <div>
      <label className="block text-gray-900 font-semibold mb-2">
        Versículo Bíblico
      </label>
      <textarea
        value={configPersonalizada?.versiculo || ''}
        onChange={(e) => handleConfigPersonalizadaChange('versiculo', e.target.value)}
        placeholder="Ej: He aquí, herencia de Jehová son los hijos; Cosa de estima el fruto del vientre. — Salmos 127:3"
        rows={3}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
      />
    </div>
  </div>
        )}

        {/* Aniversario */}
        {tipoEvento === 'aniversario' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Años de Matrimonio *
              </label>
              <input
                type="number"
                value={configPersonalizada?.anios || ''}
                onChange={(e) => handleConfigPersonalizadaChange('anios', e.target.value)}
                placeholder="Ej: 25"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombres de la Pareja *
              </label>
              <input
                type="text"
                value={configPersonalizada?.parejaNombres || ''}
                onChange={(e) => handleConfigPersonalizadaChange('parejaNombres', e.target.value)}
                placeholder="Ej: Juan y María"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Corporativo */}
        {tipoEvento === 'corporativo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={configPersonalizada?.empresa || ''}
                onChange={(e) => handleConfigPersonalizadaChange('empresa', e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Tipo de Evento
              </label>
              <input
                type="text"
                value={configPersonalizada?.tipoEvento || ''}
                onChange={(e) => handleConfigPersonalizadaChange('tipoEvento', e.target.value)}
                placeholder="Ej: Navidad, Lanzamiento, Conferencia"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Agenda
              </label>
              <textarea
                value={configPersonalizada?.agenda || ''}
                onChange={(e) => handleConfigPersonalizadaChange('agenda', e.target.value)}
                placeholder="Programa del evento"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              />
            </div>
          </div>
        )}

        {/* Guardar configuración personalizada - removed, using single save */}
      </div>

      {/* Single Save Button */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
      >
        {saving ? '⏳ Guardando todo...' : '💾 Guardar Toda la Configuración'}
      </button>
    </div>
  );
}