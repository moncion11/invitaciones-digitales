// src/components/EventConfig.tsx
'use client';
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { tiposEvento, getTextosPorDefecto } from '@/lib/eventTypes';
import { useModal } from './Modal';

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

  const handleSave = async () => {
    if (!eventId) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'eventos', eventId);
      await updateDoc(docRef, {
        configuracion: {
          fecha,
          hora,
          lugar,
          mapaUrl,
          mensaje,
          personalizada: configPersonalizada,
        },
        tituloPrincipal,
        subtitulo,
        mensajeBienvenida,
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

  const handleSaveTexts = async () => {
    if (!eventId) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'eventos', eventId);
      await updateDoc(docRef, {
        tipoEvento,
        tituloPrincipal,
        subtitulo,
        mensajeBienvenida,
      });
      
      showAlert('Textos actualizados correctamente', 'success');
    } catch (error) {
      console.error('Error updating texts:', error);
      showAlert('Error al actualizar textos', 'error');
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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">⚙️ Configuración del Evento</h2>

      {/* Tipo de Evento */}
      <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span> Tipo de Evento
        </h3>
        <select
          value={tipoEvento}
          onChange={(e) => {
            setTipoEvento(e.target.value);
            const textos = getTextosPorDefecto(e.target.value);
            setTituloPrincipal(textos.titulo);
            setSubtitulo(textos.subtitulo);
            setMensajeBienvenida(textos.bienvenida);
          }}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
        >
          {tiposEvento.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.icono} {tipo.nombre}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          💡 Al cambiar el tipo de evento, los textos se actualizarán automáticamente
        </p>
      </div>

      {/* Información Básica */}
      <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span> Información del Evento
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Fecha del Evento
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium"
            />
          </div>
          
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Hora del Evento
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium"
            />
          </div>
          
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Lugar del Evento
            </label>
            <input
              type="text"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Salón de Eventos Los Ángeles, Av. Principal #123"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Link de Ubicación (Google Maps)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={mapaUrl}
                onChange={(e) => setMapaUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (!lugar) {
                    showAlert('Primero escribe la dirección del lugar', 'warning');
                    return;
                  }
                  const encodedAddress = encodeURIComponent(lugar);
                  setMapaUrl(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
                  showAlert('Link de Google Maps generado', 'success');
                }}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition whitespace-nowrap"
              >
                📍 Generar
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              💡 Pega un link de Google Maps o presiona &quot;Generar&quot; para crearlo automáticamente desde la dirección
            </p>
          </div>

          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Mensaje Personalizado
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              placeholder="Ej: Nos haría muy feliz contar con tu presencia..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none text-gray-900 font-medium placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>

      {/* Campos Personalizados por Tipo de Evento */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span> Campos Personalizados
        </h3>
        
        <p className="text-gray-700 mb-4 text-sm">
          💡 Estos campos son específicos para el tipo de evento seleccionado
        </p>

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

        {/* Guardar configuración personalizada */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar Campos Personalizados'}
        </button>
      </div>

      {/* Textos Personalizables */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✏️</span> Textos Personalizables
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={tituloPrincipal}
              onChange={(e) => setTituloPrincipal(e.target.value)}
              placeholder="Ej: ¡Baby Shower!"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium placeholder-gray-400"
            />
            <p className="text-sm text-gray-700 mt-1">
              Ej: "¡Baby Shower!", "¡Feliz Cumpleaños!", "¡Nuestra Boda!"
            </p>
          </div>
          
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Ej: Estás invitado a celebrar la llegada de"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium placeholder-gray-400"
            />
            <p className="text-sm text-gray-700 mt-1">
              Ej: "Estás invitado a celebrar la llegada de", "Acompáñanos a celebrar"
            </p>
          </div>
          
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Mensaje de Bienvenida
            </label>
            <input
              type="text"
              value={mensajeBienvenida}
              onChange={(e) => setMensajeBienvenida(e.target.value)}
              placeholder="Ej: y su pequeño tesoro"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium placeholder-gray-400"
            />
            <p className="text-sm text-gray-700 mt-1">
              Ej: "y su pequeño tesoro", "los 15 años de", "este momento especial"
            </p>
          </div>
          
          <button
            onClick={handleSaveTexts}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar Textos'}
          </button>
        </div>
      </div>

      {/* Vista Previa */}
      <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
    <span className="text-2xl">👁️</span> Vista Previa Completa
  </h3>
  
  <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 space-y-4">
    <div className="text-center space-y-2">
      <h4 className="text-3xl font-bold text-pink-600">{tituloPrincipal}</h4>
      <p className="text-gray-900 text-lg">{subtitulo}</p>
      
      {/* ✅ CAMBIO: Mostrar nombre del bebé si existe, sino nombre del evento */}
      <p className="text-2xl font-bold text-purple-600">
        {configPersonalizada?.nombreBebe || eventName || 'Nombre del Evento'}
      </p>
      
      <p className="text-gray-900 text-lg">{mensajeBienvenida}</p>
    </div>
          
          <div className="border-t-2 border-purple-200 pt-4">
            <p className="text-center text-gray-700 font-semibold mb-3">📋 Detalles del Evento</p>
            <div className="space-y-2 text-gray-900">
              {fecha && (
                <p className="flex items-center justify-center gap-2 font-medium">
                  <span className="text-2xl">📅</span> <span><strong>Fecha:</strong> {fecha}</span>
                </p>
              )}
              {hora && (
                <p className="flex items-center justify-center gap-2 font-medium">
                  <span className="text-2xl">🕐</span> <span><strong>Hora:</strong> {hora}</span>
                </p>
              )}
              {lugar && (
                <p className="flex items-center justify-center gap-2 font-medium">
                  <span className="text-2xl">📍</span> <span><strong>Lugar:</strong> {lugar}</span>
                </p>
              )}
            </div>
          </div>

          {/* Vista previa de campos personalizados */}
          {tipoEvento === 'cumpleanos-ninos' && configPersonalizada?.edad && (
            <div className="border-t-2 border-purple-200 pt-4 text-center">
              <p className="text-gray-700 font-semibold mb-2">🎂 ¡{configPersonalizada.edad} Años!</p>
              {configPersonalizada.temaFiesta && (
                <p className="text-gray-900"><strong>Tema:</strong> {configPersonalizada.temaFiesta}</p>
              )}
            </div>
          )}

          {tipoEvento === 'boda' && (configPersonalizada?.novioNombre || configPersonalizada?.noviaNombre) && (
            <div className="border-t-2 border-purple-200 pt-4 text-center">
              <p className="text-gray-900 font-bold text-xl">
                {configPersonalizada.novioNombre || 'Novio'} & {configPersonalizada.noviaNombre || 'Novia'}
              </p>
              {configPersonalizada.dressCode && (
                <p className="text-gray-700 mt-2"><strong>Código de Vestimenta:</strong> {configPersonalizada.dressCode}</p>
              )}
            </div>
          )}

          {tipoEvento === 'graduacion' && configPersonalizada?.graduadoNombre && (
            <div className="border-t-2 border-purple-200 pt-4 text-center">
              <p className="text-gray-900 font-bold">🎓 {configPersonalizada.graduadoNombre}</p>
              {configPersonalizada.carrera && (
                <p className="text-gray-700">{configPersonalizada.carrera}</p>
              )}
              {configPersonalizada.institucion && (
                <p className="text-gray-700">{configPersonalizada.institucion}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}