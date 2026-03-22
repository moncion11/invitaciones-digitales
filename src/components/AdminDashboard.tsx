// src/components/AdminDashboard.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GuestsManager from './GuestsManager';
import GiftsManager from './GiftsManager';
import EventConfig from './EventConfig';
import Reports from './Reports';

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard', label: '📊 Inicio', icon: '📊' },
    { id: 'guests', label: '👥 Invitados', icon: '👥' },
    { id: 'gifts', label: '🎁 Regalos', icon: '🎁' },
    { id: 'config', label: '⚙️ Configuración', icon: '⚙️' },
    { id: 'reports', label: '📋 Reportes', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🎉 Baby Shower - Admin</h1>
            <p className="text-pink-100 text-sm">Panel de Administración</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'dashboard' && (
          <DashboardHome 
            selectedEvent={selectedEvent} 
            setSelectedEvent={setSelectedEvent} 
          />
        )}
        {activeTab === 'guests' && <GuestsManager eventId={selectedEvent} />}
        {activeTab === 'gifts' && <GiftsManager eventId={selectedEvent} />}
        {activeTab === 'config' && <EventConfig eventId={selectedEvent} />}
        {activeTab === 'reports' && <Reports eventId={selectedEvent} />}
      </main>
    </div>
  );
}

// Componente de Inicio/Dashboard con múltiples eventos
function DashboardHome({ 
  selectedEvent, 
  setSelectedEvent 
}: { 
  selectedEvent: string | null;
  setSelectedEvent: (id: string | null) => void;
}) {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDesign, setNewEventDesign] = useState('rosa-clasico');
  const [loading, setLoading] = useState(false);

  const fetchEventos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'eventos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(lista);
      
      if (lista.length > 0 && !selectedEvent) {
        setSelectedEvent(lista[0].id);
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const createNewEvent = async () => {
    if (!newEventName.trim()) {
      alert('❌ Por favor ingresa un nombre para el evento');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = Math.random().toString(36).substring(2, 10) + 
                    Math.random().toString(36).substring(2, 6);
      
      await addDoc(collection(db, 'eventos'), {
        nombre: newEventName,
        token: token,
        fechaCreacion: new Date().toISOString(),
        diseño: newEventDesign,
        configuracion: {
          fecha: '',
          hora: '',
          lugar: '',
          mensaje: 'Nos haría muy feliz contar con tu presencia para celebrar la llegada de nuestro bebé.',
        },
        activo: true,
      });
      
      setNewEventName('');
      setNewEventDesign('rosa-clasico');
      setShowNewEventForm(false);
      fetchEventos();
      alert(`✅ Evento creado exitosamente!\n\nToken: ${token}\n\nGuarda este token para el dashboard del cliente.`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('❌ Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el evento "${eventName}"?\n\nEsta acción no se puede deshacer y se perderán todos los invitados y regalos.`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'eventos', eventId));
      fetchEventos();
      
      if (selectedEvent === eventId) {
        setSelectedEvent(null);
      }
      
      alert('✅ Evento eliminado');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('❌ Error al eliminar el evento');
    }
  };

  const copyLink = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`📋 ${label} copiado al portapapeles:\n\n${text}`);
  };

  const diseños = [
    { id: 'rosa-clasico', nombre: '🎀 Rosa Clásico', colores: 'from-pink-300 to-purple-300' },
    { id: 'azul-bebe', nombre: '👶 Azul Bebé', colores: 'from-blue-300 to-cyan-300' },
    { id: 'dorado-lujo', nombre: '✨ Dorado Lujo', colores: 'from-yellow-300 to-amber-400' },
    { id: 'verde-natural', nombre: '🌿 Verde Natural', colores: 'from-green-300 to-emerald-400' },
    { id: 'morado-magico', nombre: '🦄 Morado Mágico', colores: 'from-purple-300 to-violet-400' },
    { id: 'arcoiris', nombre: '🌈 Arcoíris', colores: 'from-pink-400 via-purple-400 to-blue-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mis Eventos</h2>
          <p className="text-gray-600 mt-1">Gestiona todos tus baby showers</p>
        </div>
        <button
          onClick={() => setShowNewEventForm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition font-semibold shadow-lg"
        >
          + Nuevo Evento
        </button>
      </div>

      {/* Formulario de nuevo evento */}
      {showNewEventForm && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-pink-200">
          <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎉</span> Crear Nuevo Evento
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Nombre del evento *
              </label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Ej: Baby Shower María González"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-gray-900 font-semibold mb-2">
                Diseño de la invitación *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {diseños.map((diseño) => (
                  <button
                    key={diseño.id}
                    onClick={() => setNewEventDesign(diseño.id)}
                    className={`p-3 rounded-lg border-2 transition ${
                      newEventDesign === diseño.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className={`h-12 rounded bg-gradient-to-r ${diseño.colores} mb-2`} />
                    <p className="text-sm font-medium text-gray-900">{diseño.nombre}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-800 font-medium flex items-center gap-2">
                <span className="text-xl">💡</span> Información importante
              </p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• El token se genera automáticamente y es único</li>
                <li>• Guarda el token para compartir el dashboard con el cliente</li>
                <li>• Puedes cambiar el diseño después si es necesario</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={createNewEvent}
                disabled={loading || !newEventName.trim()}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg transition disabled:opacity-50 font-semibold shadow-md"
              >
                {loading ? '⏳ Creando...' : '✅ Crear Evento'}
              </button>
              <button
                onClick={() => {
                  setShowNewEventForm(false);
                  setNewEventName('');
                  setNewEventDesign('rosa-clasico');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-3 rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className={`bg-white p-6 rounded-xl shadow-md border-2 transition cursor-pointer ${
              selectedEvent === evento.id
                ? 'border-pink-500 ring-2 ring-pink-200'
                : 'border-transparent hover:border-pink-300'
            }`}
            onClick={() => setSelectedEvent(evento.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 relative z-10">
                {evento.nombre}
              </h3>
              {selectedEvent === evento.id && (
                <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  ✅ Seleccionado
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">Token del evento</p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-900 block">
                {evento.token}
              </code>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">Diseño</p>
              <p className="text-gray-900 font-medium text-sm">
                {evento.diseño?.replace('-', ' ').toUpperCase() || 'Rosa Clásico'}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">Creado</p>
              <p className="text-gray-900 text-sm">
                {evento.fechaCreacion 
                  ? new Date(evento.fechaCreacion).toLocaleDateString('es-ES')
                  : 'Fecha desconocida'}
              </p>
            </div>

            <div className="space-y-2">
      <a
        href={`/dashboard/${evento.token}`}
        target="_blank"
        className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-lg transition text-sm font-semibold"
      >
        👁️ Dashboard Cliente
      </a>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyLink(`${window.location.origin}/dashboard/${evento.token}`, 'Link del Dashboard del Cliente');
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 rounded-lg transition text-xs font-medium"
        >
          📋 Copiar Link
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteEvent(evento.id, evento.nombre);
          }}
          className="bg-red-100 hover:bg-red-200 text-red-800 py-2 rounded-lg transition text-xs font-medium"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  </div>
))}
      </div>

      {eventos.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <p className="text-6xl mb-4">📭</p>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No tienes eventos creados
          </h3>
          <p className="text-gray-600 mb-6">
            Haz clic en "Nuevo Evento" para crear tu primer baby shower
          </p>
          <button
            onClick={() => setShowNewEventForm(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg transition font-semibold"
          >
            + Crear Primer Evento
          </button>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">📖</span> Cómo usar este panel
        </h3>
        <ol className="text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <span>Haz clic en <strong>"Nuevo Evento"</strong> y completa la información</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <span>Guarda el <strong>token</strong> que se genera (es único para cada evento)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <span>Selecciona un evento haciendo clic en él para gestionar invitados y regalos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
            <span>Comparte el <strong>Dashboard Cliente</strong> con el organizador del evento</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
            <span>Envía los links de invitación (<code>/?inv=ID_INVITADO</code>) a cada invitado</span>
          </li>
        </ol>
      </div>
    </div>
  );
}