// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, doc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
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
  const [loginLoading, setLoginLoading] = useState(false);

  const ADMIN_PASSWORD = 'Camd.0311';

  // Dashboard state
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New event form
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [tipoEvento, setTipoEvento] = useState('baby-shower');
  const [diseño, setDiseño] = useState('rosa-clasico');
  const [plantillaId, setPlantillaId] = useState('');
  const [creandoEvento, setCreandoEvento] = useState(false);
  const [eventoConfig, setEventoConfig] = useState<any>(null);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);

  // Stats for dashboard
  const [statsInvitados, setStatsInvitados] = useState({ total: 0, confirmados: 0, pendientes: 0 });
  const [statsRegalos, setStatsRegalos] = useState({ total: 0, reservados: 0, disponibles: 0 });

  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchEventos();
      fetchPlantillas();
    }
    setLoading(false);
  }, []);

  // Load stats when event is selected
  useEffect(() => {
    if (!selectedEvent) {
      setStatsInvitados({ total: 0, confirmados: 0, pendientes: 0 });
      setStatsRegalos({ total: 0, reservados: 0, disponibles: 0 });
      return;
    }

    const unsubInvitados = onSnapshot(
      collection(db, 'eventos', selectedEvent, 'invitados'),
      (snapshot) => {
        const total = snapshot.size;
        const confirmados = snapshot.docs.filter(d => d.data().confirmado).length;
        setStatsInvitados({ total, confirmados, pendientes: total - confirmados });
      }
    );

    const unsubRegalos = onSnapshot(
      collection(db, 'eventos', selectedEvent, 'regalos'),
      (snapshot) => {
        const total = snapshot.size;
        const reservados = snapshot.docs.filter(d => {
          const data = d.data();
          return !data.disponible || (data.stock !== undefined && !data.ilimitado && data.stock <= 0);
        }).length;
        setStatsRegalos({ total, reservados, disponibles: total - reservados });
      }
    );

    return () => {
      unsubInvitados();
      unsubRegalos();
    };
  }, [selectedEvent]);

  const fetchPlantillas = async () => {
    try {
      const data = await getPlantillas();
      setPlantillas(data.filter(p => p.activa));
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminAuthenticated', 'true');
        setIsAuthenticated(true);
        setError('');
        fetchEventos();
        fetchPlantillas();
      } else {
        setError('❌ Usuario o contraseña incorrectos. Intenta de nuevo.');
        setPassword('');
      }
      setLoginLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    showConfirm('¿Estás seguro de cerrar sesión?', () => {
      localStorage.removeItem('adminAuthenticated');
      setIsAuthenticated(false);
      setPassword('');
      setSelectedEvent(null);
      setActiveSection('dashboard');
    });
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
          setActiveSection('dashboard');
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

  const showSection = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const eventoSeleccionado = eventos.find(e => e.id === selectedEvent);

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Bienvenido al panel de administración' },
    eventos: { title: 'Eventos', subtitle: 'Crea y gestiona tus eventos' },
    configuracion: { title: 'Configuración', subtitle: 'Ajusta las opciones de tu evento' },
    invitados: { title: 'Invitados', subtitle: 'Gestiona la lista de invitados' },
    regalos: { title: 'Regalos', subtitle: 'Administra la lista de regalos' },
    reportes: { title: 'Reportes', subtitle: 'Visualiza estadísticas y reportes' },
    plantillas: { title: 'Plantillas', subtitle: 'Gestiona las plantillas de diseño' },
  };

  if (loading) return null;

  // ========== LOGIN ==========
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-2 border-purple-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
              InvitaDigital
            </h1>
            <p className="text-gray-600 text-lg">Panel de Administración</p>
            <p className="text-gray-500 text-sm mt-2">🔒 Acceso Restringido</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">🔐 Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-900"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loginLoading ? (
                <><span>⏳</span> Verificando...</>
              ) : (
                <><span>🔓</span> Ingresar al Panel</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-gray-700 text-sm">
                <span className="font-bold">💡 Nota:</span> Este panel es solo para uso interno del administrador
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/portafolio" className="text-purple-600 hover:text-purple-800 font-medium text-sm transition">
              ← Volver al Portafolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ========== ADMIN DASHBOARD WITH SIDEBAR ==========
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:fixed h-full w-64 bg-white shadow-xl z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="font-bold text-gray-900">InvitaDigital</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'eventos', icon: '📅', label: 'Eventos' },
            { id: 'configuracion', icon: '⚙️', label: 'Configuración', needsEvent: true },
            { id: 'invitados', icon: '👥', label: 'Invitados', needsEvent: true },
            { id: 'regalos', icon: '🎁', label: 'Regalos', needsEvent: true },
            { id: 'reportes', icon: '📈', label: 'Reportes', needsEvent: true },
            { id: 'plantillas', icon: '🎨', label: 'Plantillas' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'plantillas') {
                  router.push('/admin/plantillas');
                } else {
                  showSection(item.id);
                }
              }}
              disabled={item.needsEvent && !selectedEvent}
              className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'hover:bg-purple-50 text-gray-700'
              } ${item.needsEvent && !selectedEvent ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Selected event indicator */}
        {selectedEvent && eventoSeleccionado && (
          <div className="mx-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold mb-1">Evento activo:</p>
            <p className="text-sm font-bold text-gray-900 truncate">{eventoSeleccionado.nombre}</p>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setActiveSection('eventos');
              }}
              className="text-xs text-purple-600 hover:text-purple-800 mt-1"
            >
              Cambiar evento →
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 hover:bg-red-50 text-red-600"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top header */}
        <header className="bg-white shadow-sm px-4 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 text-2xl"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {sectionTitles[activeSection]?.title || 'Dashboard'}
              </h1>
              <p className="text-gray-500 text-sm">
                {sectionTitles[activeSection]?.subtitle || ''}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Administrador</p>
                <p className="text-xs text-gray-500">admin@invitadigital.com</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">

          {/* ===== DASHBOARD SECTION ===== */}
          {activeSection === 'dashboard' && (
            <div className="fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{eventos.length}</h3>
                  <p className="text-gray-500">Total Eventos</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{statsInvitados.total}</h3>
                  <p className="text-gray-500">Total Invitados</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{statsInvitados.confirmados}</h3>
                  <p className="text-gray-500">Confirmados</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{statsRegalos.reservados}</h3>
                  <p className="text-gray-500">Regalos Reservados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event summary */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Mis Eventos</h3>
                  {eventos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-4xl mb-2">📅</p>
                      <p>No tienes eventos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {eventos.slice(0, 5).map(evento => (
                        <div
                          key={evento.id}
                          onClick={() => {
                            setSelectedEvent(evento.id);
                            showSection('configuracion');
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-purple-50 ${
                            selectedEvent === evento.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                          }`}
                        >
                          <span className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                            {tiposEvento.find(t => t.id === evento.tipoEvento)?.icono || '🎉'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{evento.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {tiposEvento.find(t => t.id === evento.tipoEvento)?.nombre || 'Evento'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            evento.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {evento.activo ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                        </div>
                      ))}
                      {eventos.length > 5 && (
                        <button
                          onClick={() => showSection('eventos')}
                          className="w-full text-center text-purple-600 hover:text-purple-800 text-sm font-medium py-2"
                        >
                          Ver todos ({eventos.length}) →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => showSection('eventos')}
                      className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-lg transition text-center"
                    >
                      <span className="text-3xl block mb-2">➕</span>
                      <span className="font-semibold text-gray-900 text-sm">Crear Evento</span>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedEvent) showSection('invitados');
                        else showAlert('Selecciona un evento primero', 'warning');
                      }}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition text-center"
                    >
                      <span className="text-3xl block mb-2">👥</span>
                      <span className="font-semibold text-gray-900 text-sm">Ver Invitados</span>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedEvent) showSection('regalos');
                        else showAlert('Selecciona un evento primero', 'warning');
                      }}
                      className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:shadow-lg transition text-center"
                    >
                      <span className="text-3xl block mb-2">🎁</span>
                      <span className="font-semibold text-gray-900 text-sm">Gestionar Regalos</span>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedEvent) showSection('reportes');
                        else showAlert('Selecciona un evento primero', 'warning');
                      }}
                      className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition text-center"
                    >
                      <span className="text-3xl block mb-2">📊</span>
                      <span className="font-semibold text-gray-900 text-sm">Ver Reportes</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats summary for selected event */}
              {selectedEvent && eventoSeleccionado && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Confirmaciones - {eventoSeleccionado.nombre}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <div>
                            <p className="font-bold text-gray-900">Confirmados</p>
                            <p className="text-sm text-gray-500">
                              {statsInvitados.total > 0
                                ? `${Math.round((statsInvitados.confirmados / statsInvitados.total) * 100)}% del total`
                                : '0%'}
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-green-600">{statsInvitados.confirmados}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⏳</span>
                          <div>
                            <p className="font-bold text-gray-900">Pendientes</p>
                            <p className="text-sm text-gray-500">
                              {statsInvitados.total > 0
                                ? `${Math.round((statsInvitados.pendientes / statsInvitados.total) * 100)}% del total`
                                : '0%'}
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-yellow-600">{statsInvitados.pendientes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🎁 Regalos - {eventoSeleccionado.nombre}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📦</span>
                          <p className="font-bold text-gray-900">Total Regalos</p>
                        </div>
                        <span className="text-3xl font-bold text-purple-600">{statsRegalos.total}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <p className="font-bold text-gray-900">Reservados</p>
                        </div>
                        <span className="text-3xl font-bold text-green-600">{statsRegalos.reservados}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⏳</span>
                          <p className="font-bold text-gray-900">Disponibles</p>
                        </div>
                        <span className="text-3xl font-bold text-orange-600">{statsRegalos.disponibles}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== EVENTOS SECTION ===== */}
          {activeSection === 'eventos' && (
            <div className="fade-in space-y-8">
              {/* Create Event */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">➕ Crear Nuevo Evento</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Nombre del Evento *</label>
                    <input
                      type="text"
                      value={nuevoEvento}
                      onChange={(e) => setNuevoEvento(e.target.value)}
                      placeholder="Ej: Baby Shower de María"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Tipo de Evento *</label>
                    <select
                      value={tipoEvento}
                      onChange={(e) => setTipoEvento(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      {tiposEvento.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.icono} {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Diseño</label>
                    <select
                      value={diseño}
                      onChange={(e) => setDiseño(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
                    <label className="block text-gray-700 font-semibold mb-2">Plantilla</label>
                    <select
                      value={plantillaId}
                      onChange={(e) => setPlantillaId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      <option value="">Sin plantilla (diseño básico)</option>
                      {plantillas.map(p => (
                        <option key={p.id} value={p.id!}>🎨 {p.nombre} ({p.categoria})</option>
                      ))}
                    </select>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <p className="text-gray-500">{plantillas.length} plantilla{plantillas.length !== 1 ? 's' : ''}</p>
                      <a href="/admin/plantillas" target="_blank" className="text-purple-600 hover:text-purple-800 font-medium">
                        Gestionar →
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  onClick={crearEvento}
                  disabled={creandoEvento || !nuevoEvento.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {creandoEvento ? '⏳ Creando...' : '✨ Crear Evento'}
                </button>
              </div>

              {/* Events List */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">📋 Mis Eventos</h3>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
                  </span>
                </div>

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
                        onClick={() => {
                          setSelectedEvent(evento.id);
                          showSection('configuracion');
                        }}
                        className={`border-2 rounded-2xl p-6 cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg ${
                          selectedEvent === evento.id
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl">
                            {tiposEvento.find(t => t.id === evento.tipoEvento)?.icono || '🎉'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            evento.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {evento.activo ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{evento.nombre}</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          {tiposEvento.find(t => t.id === evento.tipoEvento)?.nombre || 'Evento'}
                        </p>

                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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
                              onClick={() => copyLink(`${window.location.origin}/dashboard/${evento.token}`, 'Link del Dashboard')}
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2 rounded-lg transition text-xs font-medium"
                            >
                              📋 Copiar Link
                            </button>
                            <button
                              onClick={() => {
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
                            onClick={() => eliminarEvento(evento.id, evento.nombre)}
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

          {/* ===== CONFIGURACIÓN SECTION ===== */}
          {activeSection === 'configuracion' && selectedEvent && (
            <div className="fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <EventConfig
                  eventId={selectedEvent}
                  eventName={eventoSeleccionado?.nombre}
                  configuracion={eventoConfig}
                  onConfigChange={setEventoConfig}
                />
              </div>
            </div>
          )}

          {/* ===== INVITADOS SECTION ===== */}
          {activeSection === 'invitados' && selectedEvent && (
            <div className="fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <GuestsManager eventId={selectedEvent} />
              </div>
            </div>
          )}

          {/* ===== REGALOS SECTION ===== */}
          {activeSection === 'regalos' && selectedEvent && (
            <div className="fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <GiftsManager eventId={selectedEvent} />
              </div>
            </div>
          )}

          {/* ===== REPORTES SECTION ===== */}
          {activeSection === 'reportes' && selectedEvent && (
            <div className="fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <Reports eventId={selectedEvent} />
              </div>
            </div>
          )}

          {/* No event selected warning */}
          {['configuracion', 'invitados', 'regalos', 'reportes'].includes(activeSection) && !selectedEvent && (
            <div className="fade-in">
              <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Selecciona un Evento</h3>
                <p className="text-gray-500 mb-6">Necesitas seleccionar un evento para ver esta sección</p>
                <button
                  onClick={() => showSection('eventos')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition shadow-lg"
                >
                  📋 Ir a Eventos
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
