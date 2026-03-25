// src/components/AdminDashboard.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { tiposEvento, getTextosPorDefecto } from '@/lib/eventTypes';
import EventConfig from './EventConfig';
import GuestsManager from './GuestsManager';
import GiftsManager from './GiftsManager';
import Reports from './Reports';
import { useModal } from './Modal';

interface Evento {
  id: string;
  nombre: string;
  tipoEvento: string;
  token: string;
  diseño: string;
  fechaCreacion: any;
  activo: boolean;
}

export default function AdminDashboard() {
  const { showAlert, showConfirm } = useModal();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('eventos');
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [tipoEvento, setTipoEvento] = useState('baby-shower');
  const [diseño, setDiseño] = useState('rosa-clasico');
  const [loading, setLoading] = useState(false);
  const [eventoConfig, setEventoConfig] = useState<any>(null);

  // Textos por defecto
  const [tituloPrincipal, setTituloPrincipal] = useState('¡Baby Shower!');
  const [subtitulo, setSubtitulo] = useState('Estás invitado a celebrar la llegada de');
  const [mensajeBienvenida, setMensajeBienvenida] = useState('y su pequeño tesoro');

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const eventosSnapshot = await getDocs(collection(db, 'eventos'));
      const eventosList = eventosSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Evento[];
      setEventos(eventosList);
    } catch (error) {
      console.error('Error fetching eventos:', error);
    }
  };

  const generarToken = () => {
    return Math.random().toString(36).substring(2, 12) + 
           Math.random().toString(36).substring(2, 12);
  };

  const crearEvento = async () => {
    if (!nuevoEvento.trim()) {
      showAlert('Por favor ingresa un nombre para el evento', 'warning');
      return;
    }

    setLoading(true);
    try {
      const textos = getTextosPorDefecto(tipoEvento);
      
      await addDoc(collection(db, 'eventos'), {
        nombre: nuevoEvento,
        tipoEvento,
        token: generarToken(),
        diseño,
        tituloPrincipal: textos.titulo,
        subtitulo: textos.subtitulo,
        mensajeBienvenida: textos.bienvenida,
        fechaCreacion: Timestamp.now(),
        activo: true,
      });

      setNuevoEvento('');
      showAlert('Evento creado exitosamente', 'success');
      fetchEventos();
    } catch (error) {
      console.error('Error creating evento:', error);
      showAlert('Error al crear evento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarEvento = (eventoId: string, eventoNombre: string) => {
    showConfirm(`¿Estás seguro de eliminar el evento "${eventoNombre}"? Esta acción no se puede deshacer.`, async () => {
      try {
        await deleteDoc(doc(db, 'eventos', eventoId));
        showAlert('Evento eliminado correctamente', 'success');
        fetchEventos();
        if (selectedEvent === eventoId) {
          setSelectedEvent(null);
        }
      } catch (error) {
        console.error('Error deleting evento:', error);
        showAlert('Error al eliminar evento', 'error');
      }
    });
  };

  const copyLink = (link: string, nombre: string) => {
    navigator.clipboard.writeText(link);
    showAlert(`${nombre} copiado al portapapeles:\n\n${link}`, 'info');
  };

  const eventoSeleccionado = eventos.find(e => e.id === selectedEvent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-8 shadow-lg">
  <div className="container mx-auto px-4">
    <div className="flex items-center gap-3">
      <span className="text-4xl">🎉</span>
      <div>
        <h1 className="text-4xl font-bold">InvitaDigital | Admin</h1>
        <p className="text-white/90 mt-1">Panel de Administración - Invitaciones para Todo Evento</p>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'eventos', label: '📅 Eventos', icon: '📅' },
            { id: 'config', label: '⚙️ Configuración', icon: '⚙️' },
            { id: 'invitados', label: '👥 Invitados', icon: '👥' },
            { id: 'regalos', label: '🎁 Regalos', icon: '🎁' },
            { id: 'reportes', label: '📊 Reportes', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!selectedEvent && tab.id !== 'eventos'}
              className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              } ${!selectedEvent && tab.id !== 'eventos' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Eventos */}
        {activeTab === 'eventos' && (
          <div className="space-y-8">
            
            {/* Crear Evento */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Crear Nuevo Evento</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    value={nuevoEvento}
                    onChange={(e) => setNuevoEvento(e.target.value)}
                    placeholder="Ej: Baby Shower de María"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Tipo de Evento *
                  </label>
                  <select
                    value={tipoEvento}
                    onChange={(e) => {
                      setTipoEvento(e.target.value);
                      const textos = getTextosPorDefecto(e.target.value);
                      setTituloPrincipal(textos.titulo);
                      setSubtitulo(textos.subtitulo);
                      setMensajeBienvenida(textos.bienvenida);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  >
                    {tiposEvento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.icono} {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Diseño
                  </label>
                  <select
                    value={diseño}
                    onChange={(e) => setDiseño(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  >
                    <option value="rosa-clasico">🎀 Rosa Clásico</option>
                    <option value="azul-bebe">⭐ Azul Bebé</option>
                    <option value="dorado-lujo">👑 Dorado Lujo</option>
                    <option value="verde-natural">🍃 Verde Natural</option>
                    <option value="morado-magico">🌟 Morado Mágico</option>
                    <option value="arcoiris">🎨 Arcoíris</option>
                  </select>
                </div>
              </div>

              <button
                onClick={crearEvento}
                disabled={loading || !nuevoEvento.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Creando...' : '✨ Crear Evento'}
              </button>
            </div>

            {/* Lista de Eventos */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Mis Eventos</h2>
              
              {eventos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-6xl mb-4">📅</p>
                  <p className="text-gray-600 text-lg">No tienes eventos creados aún</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventos.map((evento) => (
                    <div
                      key={evento.id}
                      onClick={() => setSelectedEvent(evento.id)}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition transform hover:scale-105 ${
                        selectedEvent === evento.id
                          ? 'border-pink-500 bg-pink-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">
                          {tiposEvento.find(t => t.id === evento.tipoEvento)?.icono || '🎉'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          evento.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {evento.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{evento.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {tiposEvento.find(t => t.id === evento.tipoEvento)?.nombre || 'Evento'}
                      </p>
                      
                      <div className="space-y-2">
                        <a
                          href={`/dashboard/${evento.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-lg transition text-sm font-semibold"
                        >
                          👁️ Dashboard Cliente
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(`${window.location.origin}/dashboard/${evento.token}`, 'Link del Dashboard');
                            }}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 rounded-lg transition text-xs font-medium"
                          >
                            📋 Copiar Link
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const genericLink = `${window.location.origin}/?evento=${evento.token}`;
                              navigator.clipboard.writeText(genericLink);
                              showAlert(`Link genérico copiado:\n\n${genericLink}\n\nCualquier persona puede usar este link y poner su nombre.`, 'info');
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg transition text-xs font-medium"
                          >
                            🔗 Link Genérico
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarEvento(evento.id, evento.nombre);
                          }}
                          className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 rounded-lg transition text-xs font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Configuración */}
        {activeTab === 'config' && selectedEvent && (
          <EventConfig
            eventId={selectedEvent}
            eventName={eventoSeleccionado?.nombre}
            configuracion={eventoConfig}
            onConfigChange={setEventoConfig}
          />
        )}

        {/* Tab: Invitados */}
        {activeTab === 'invitados' && selectedEvent && (
          <GuestsManager eventId={selectedEvent} />
        )}

        {/* Tab: Regalos */}
        {activeTab === 'regalos' && selectedEvent && (
          <GiftsManager eventId={selectedEvent} />
        )}

        {/* Tab: Reportes */}
        {activeTab === 'reportes' && selectedEvent && (
          <Reports eventId={selectedEvent} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-purple-100 mt-12 py-6">
  <div className="container mx-auto px-4 text-center">
    <div className="text-2xl mb-2">🎉</div>
    <p className="text-lg font-bold text-gray-900">InvitaDigital</p>
    <p className="text-sm text-gray-600">
      Panel de Administración - Solo uso interno
    </p>
    <p className="text-xs text-gray-400 mt-2">
      © {new Date().getFullYear()} InvitaDigital. Todos los derechos reservados.
    </p>
  </div>
</footer>
    </div>
  );
}