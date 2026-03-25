// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { tiposEvento, getTextosPorDefecto } from '@/lib/eventTypes';
import { Plantilla, getPlantillas } from '@/lib/templates';
import EventConfig from '@/components/EventConfig';
import GuestsManager from '@/components/GuestsManager';
import GiftsManager from '@/components/GiftsManager';
import Reports from '@/components/Reports';
import { useModal } from '@/components/Modal';

interface Evento {
  id: string;
  nombre: string;
  tipoEvento: string;
  token: string;
  diseño: string;
  plantillaId?: string;
  fechaCreacion: any;
  activo: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // ⚠️ CAMBIA ESTA CONTRASEÑA POR UNA SEGURA
  const ADMIN_PASSWORD = 'Camd.0311';

  // Estado del dashboard
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('eventos');
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [tipoEvento, setTipoEvento] = useState('baby-shower');
  const [diseño, setDiseño] = useState('rosa-clasico');
  const [plantillaId, setPlantillaId] = useState('');
  const [creandoEvento, setCreandoEvento] = useState(false);
  const [eventoConfig, setEventoConfig] = useState<any>(null);
  
  // ✅ Estado para plantillas
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);

  // Textos por defecto
  const [tituloPrincipal, setTituloPrincipal] = useState('¡Baby Shower!');
  const [subtitulo, setSubtitulo] = useState('Estás invitado a celebrar la llegada de');
  const [mensajeBienvenida, setMensajeBienvenida] = useState('y su pequeño tesoro');

  useEffect(() => {
    // Verificar si ya está autenticado
    const auth = localStorage.getItem('adminAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchEventos();
      fetchPlantillas();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setActiveTab('config');
    }
  }, [selectedEvent]);

  // ✅ Cargar plantillas
 const fetchPlantillas = async () => {
  try {
    console.log('🔍 Cargando plantillas desde Firebase...');
    const { getPlantillas } = await import('@/lib/templates');
    const data = await getPlantillas();
    console.log('✅ Plantillas cargadas:', data.length);
    console.log('📋 Datos:', data);
    
    const plantillasActivas = data.filter(p => p.activa);
    console.log('🟢 Plantillas activas:', plantillasActivas.length);
    
    setPlantillas(plantillasActivas);
  } catch (error) {
    console.error('❌ Error cargando plantillas:', error);
    showAlert('Error al cargar plantillas. Revisa la consola.', 'error');
  }
};

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      setError('');
      fetchEventos();
      fetchPlantillas();
    } else {
      setError('❌ Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

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

    setCreandoEvento(true);
    try {
      const textos = getTextosPorDefecto(tipoEvento);
      
      await addDoc(collection(db, 'eventos'), {
        nombre: nuevoEvento,
        tipoEvento,
        token: generarToken(),
        diseño,
        plantillaId: plantillaId || null,
        tituloPrincipal: textos.titulo,
        subtitulo: textos.subtitulo,
        mensajeBienvenida: textos.bienvenida,
        fechaCreacion: Timestamp.now(),
        activo: true,
      });

      setNuevoEvento('');
      setPlantillaId('');
      showAlert('Evento creado exitosamente', 'success');
      fetchEventos();
    } catch (error) {
      console.error('Error creating evento:', error);
      showAlert('Error al crear evento', 'error');
    } finally {
      setCreandoEvento(false);
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

  // Vista de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
              InvitaDigital
            </h1>
            <p className="text-gray-600 text-lg">Panel de Administración</p>
            <p className="text-gray-500 text-sm mt-2">Solo personal autorizado</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                🔐 Contraseña de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
            >
              🔓 Ingresar al Panel
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-gray-700 text-sm">
                <span className="font-bold">💡 Nota:</span> Este panel es solo para uso interno del administrador
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <a
              href="/portafolio"
              className="text-purple-600 hover:text-purple-800 font-medium text-sm transition"
            >
              ← Volver al Portafolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Vista del Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Top Bar con Logout */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <span className="font-bold text-lg">InvitaDigital | Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/plantillas')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <span>🎨</span> Plantillas
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

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
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
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
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Crear Nuevo Evento</h2>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    value={nuevoEvento}
                    onChange={(e) => setNuevoEvento(e.target.value)}
                    placeholder="Ej: Baby Shower de María"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  >
                    <option value="rosa-clasico">🎀 Rosa Clásico</option>
                    <option value="azul-bebe">⭐ Azul Bebé</option>
                    <option value="dorado-lujo">👑 Dorado Lujo</option>
                    <option value="verde-natural">🍃 Verde Natural</option>
                    <option value="morado-magico">🌟 Morado Mágico</option>
                    <option value="arcoiris">🎨 Arcoíris</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Plantilla (Opcional)
                  </label>
                  <select
                    value={plantillaId}
                    onChange={(e) => setPlantillaId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  >
                    <option value="">Sin plantilla (diseño básico)</option>
                    {plantillas.length === 0 ? (
                      <option disabled>⏳ Cargando plantillas...</option>
                    ) : (
                      plantillas.map(plantilla => (
                        <option key={plantilla.id} value={plantilla.id!}>
                          🎨 {plantilla.nombre} ({plantilla.categoria})
                        </option>
                      ))
                    )}
                  </select>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <p className="text-gray-500">
                      {plantillas.length} plantilla{plantillas.length !== 1 ? 's' : ''} disponible{plantillas.length !== 1 ? 's' : ''}
                    </p>
                    <a 
                      href="/admin/plantillas" 
                      target="_blank" 
                      className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                    >
                      Gestionar plantillas →
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={crearEvento}
                disabled={creandoEvento || !nuevoEvento.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {creandoEvento ? '⏳ Creando...' : '✨ Crear Evento'}
              </button>
            </div>

            {/* Lista de Eventos */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
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
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
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
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2 rounded-lg transition text-xs font-medium"
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
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
            <EventConfig
              eventId={selectedEvent}
              eventName={eventoSeleccionado?.nombre}
              configuracion={eventoConfig}
              onConfigChange={setEventoConfig}
            />
          </div>
        )}

        {/* Tab: Invitados */}
        {activeTab === 'invitados' && selectedEvent && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
            <GuestsManager eventId={selectedEvent} />
          </div>
        )}

        {/* Tab: Regalos */}
        {activeTab === 'regalos' && selectedEvent && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
            <GiftsManager eventId={selectedEvent} />
          </div>
        )}

        {/* Tab: Reportes */}
        {activeTab === 'reportes' && selectedEvent && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
            <Reports eventId={selectedEvent} />
          </div>
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