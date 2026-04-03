// src/app/dashboard/_/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format12Hour, formatDateSpanish } from '@/lib/utils';

export default function ClientDashboard() {
  const pathname = usePathname();
  // Extract token from /dashboard/{token} - Firebase rewrites /dashboard/** to /dashboard/_/index.html
  const token = pathname?.split('/dashboard/')?.[1]?.replace(/\/$/, '').replace(/^_\/?/, '') || '';

  const [evento, setEvento] = useState<any>(null);
  const [invitados, setInvitados] = useState<any[]>([]);
  const [regalos, setRegalos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [guestFilter, setGuestFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let unsubInvitados: (() => void) | null = null;
    let unsubRegalos: (() => void) | null = null;

    const init = async () => {
      try {
        const eventosRef = collection(db, 'eventos');
        const q = query(eventosRef, where('token', '==', token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setEvento(null);
          setLoading(false);
          return;
        }

        const eventoDoc = snapshot.docs[0];
        const eventoData = { id: eventoDoc.id, ...eventoDoc.data() };
        setEvento(eventoData);

        unsubInvitados = onSnapshot(
          collection(db, 'eventos', eventoDoc.id, 'invitados'),
          (snap) => {
            setInvitados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        );

        unsubRegalos = onSnapshot(
          collection(db, 'eventos', eventoDoc.id, 'regalos'),
          (snap) => {
            setRegalos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      unsubInvitados?.();
      unsubRegalos?.();
    };
  }, [token]);

  const getGiftName = (giftId: string) => {
    const gift = regalos.find(g => g.id === giftId);
    return gift ? gift.nombre : 'No especificado';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg font-medium">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6">El link que estás usando no es válido o el evento ya no existe.</p>
          <a
            href="/portafolio"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const confirmados = invitados.filter(i => i.confirmado);
  const pendientes = invitados.filter(i => !i.confirmado);
  const regalosDisponibles = regalos.filter(r => r.disponible !== false && (r.ilimitado || r.stock > 0));
  const regalosReservados = regalos.filter(r => !r.disponible || (!r.ilimitado && r.stock <= 0));

  const confirmationPercentage = invitados.length > 0
    ? Math.round((confirmados.length / invitados.length) * 100)
    : 0;

  const filteredGuests = guestFilter === 'all'
    ? invitados
    : guestFilter === 'confirmed'
      ? confirmados
      : pendientes;

  return (
    <div className="bg-purple-50 min-h-screen">
      <header className="bg-white border-b border-purple-200">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎉</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">InvitaDigital</h1>
                <p className="text-gray-500 text-sm">Panel de control del evento</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-lg font-bold text-purple-700">{evento.nombre}</p>
              <p className="text-xs text-gray-500">
                {evento.configuracion?.fecha ? formatDateSpanish(evento.configuracion.fecha) : ''}
              </p>
            </div>
          </div>
          <div className="sm:hidden mt-3 pt-3 border-t border-purple-100">
            <p className="text-lg font-bold text-purple-700">{evento.nombre}</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-purple-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {[
              { id: 'resumen', icon: '📊', label: 'Resumen' },
              { id: 'invitados', icon: '👥', label: 'Invitados', count: invitados.length },
              { id: 'regalos', icon: '🎁', label: 'Regalos', count: regalos.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-purple-100 text-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'resumen' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👥</span>
                  <span className="text-gray-500 text-sm font-medium">Total Invitados</span>
                </div>
                <h3 className="text-4xl font-bold text-purple-600">{invitados.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-500 text-sm font-medium">Confirmados</span>
                </div>
                <h3 className="text-4xl font-bold text-green-600">{confirmados.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏳</span>
                  <span className="text-gray-500 text-sm font-medium">Pendientes</span>
                </div>
                <h3 className="text-4xl font-bold text-orange-600">{pendientes.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎁</span>
                  <span className="text-gray-500 text-sm font-medium">Regalos Disponibles</span>
                </div>
                <h3 className="text-4xl font-bold text-pink-600">{regalosDisponibles.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📅</span> Información del Evento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-600 text-sm font-medium mb-1">📆 Fecha</p>
                  <p className="text-lg font-bold text-gray-900">
                    {evento.configuracion?.fecha ? formatDateSpanish(evento.configuracion.fecha) : 'Por definir'}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 text-sm font-medium mb-1">🕐 Hora</p>
                  <p className="text-lg font-bold text-gray-900">
                    {evento.configuracion?.hora ? format12Hour(evento.configuracion.hora) : 'Por definir'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-sm font-medium mb-1">📍 Lugar</p>
                  <p className="text-lg font-bold text-gray-900">
                    {evento.configuracion?.lugar || 'Por definir'}
                  </p>
                </div>
              </div>
              {evento.configuracion?.mapaUrl && (
                <div className="mt-4">
                  <a href={evento.configuracion.mapaUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-medium text-sm">
                    📍 Ver Ubicación en el Mapa
                  </a>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📈</span> Progreso de Confirmaciones
              </h2>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">Confirmados</span>
                  <span className="text-xs font-semibold inline-block text-green-600">{confirmationPercentage}%</span>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-green-100">
                  <div style={{ width: `${confirmationPercentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-1000 rounded-full" />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{confirmados.length} Confirmados</span>
                  <span>{pendientes.length} Pendientes</span>
                  <span>{invitados.length} Total</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📋</span> Invitados Recientes
              </h2>
              {invitados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">👥</p>
                  <p>No hay invitados registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitados.slice(0, 5).map(inv => (
                    <div key={inv.id} className={`flex items-center gap-3 p-3 rounded-lg ${inv.confirmado ? 'bg-green-50' : 'bg-purple-50'}`}>
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${inv.confirmado ? 'bg-green-100' : 'bg-purple-100'}`}>
                        {inv.confirmado ? '✅' : '👤'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{inv.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {inv.confirmado ? 'Confirmado' : 'Pendiente'}
                          {inv.regaloSeleccionado && ` • 🎁 ${getGiftName(inv.regaloSeleccionado)}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.confirmado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {inv.confirmado ? '✅' : '⏳'}
                      </span>
                    </div>
                  ))}
                  {invitados.length > 5 && (
                    <button onClick={() => setActiveTab('invitados')}
                      className="w-full text-center text-purple-600 hover:text-purple-800 text-sm font-medium py-2">
                      Ver todos ({invitados.length}) →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invitados' && (
          <div className="fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">👥</span> Lista de Invitados
              </h2>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: 'Todos', count: invitados.length },
                  { id: 'confirmed', label: '✅ Confirmados', count: confirmados.length },
                  { id: 'pending', label: '⏳ Pendientes', count: pendientes.length },
                ].map(filter => (
                  <button key={filter.id} onClick={() => setGuestFilter(filter.id)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                      guestFilter === filter.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
              {filteredGuests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">👥</p>
                  <p>No hay invitados en esta categoría</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tl-lg">Nombre</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Teléfono</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tr-lg hidden lg:table-cell">Regalo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((invitado) => (
                        <tr key={invitado.id} className="border-b border-gray-100 hover:bg-purple-50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${invitado.confirmado ? 'bg-green-100' : 'bg-purple-100'}`}>
                                {invitado.confirmado ? '✅' : '👤'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{invitado.nombre}</p>
                                {invitado.familia && <p className="text-xs text-gray-500">{invitado.familia}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{invitado.email || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{invitado.telefono || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${invitado.confirmado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {invitado.confirmado ? '✅ Confirmado' : '⏳ Pendiente'}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            {invitado.regaloSeleccionado ? (
                              <span className="text-pink-600 font-medium bg-pink-50 px-3 py-1 rounded-full text-sm">🎁 {getGiftName(invitado.regaloSeleccionado)}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'regalos' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎁</span>
                  <span className="text-gray-500 text-sm font-medium">Total Regalos</span>
                </div>
                <h3 className="text-4xl font-bold text-pink-600">{regalos.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-500 text-sm font-medium">Reservados</span>
                </div>
                <h3 className="text-4xl font-bold text-green-600">{regalosReservados.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏳</span>
                  <span className="text-gray-500 text-sm font-medium">Disponibles</span>
                </div>
                <h3 className="text-4xl font-bold text-orange-600">{regalosDisponibles.length}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🎁</span> Lista de Regalos
              </h2>
              {regalos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">🎁</p>
                  <p>No hay regalos registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regalos.map((regalo) => {
                    const disponible = regalo.disponible !== false && (regalo.ilimitado || regalo.stock > 0);
                    return (
                      <div key={regalo.id} className={`p-4 rounded-lg border-l-4 ${disponible ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-300 opacity-70'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{regalo.imagen || '🎁'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${disponible ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {disponible ? 'Disponible' : 'Reservado'}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{regalo.nombre}</h4>
                        {regalo.descripcion && <p className="text-xs text-gray-500 mb-1">{regalo.descripcion}</p>}
                        <p className="text-xs text-gray-500">📦 {regalo.ilimitado ? 'Ilimitado' : `Stock: ${regalo.stock}`}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-purple-200 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">Hecho con <span className="text-pink-500">💕</span> para celebrar momentos especiales</p>
          <p className="text-gray-400 text-xs mt-2">© {new Date().getFullYear()} InvitaDigital. Todos los derechos reservados.</p>
          <a href="/portafolio" className="inline-block mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium transition">← Volver al Portafolio</a>
        </div>
      </footer>
    </div>
  );
}
