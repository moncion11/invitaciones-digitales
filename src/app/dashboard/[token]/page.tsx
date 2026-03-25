// src/app/dashboard/[token]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format12Hour, formatDateSpanish } from '@/lib/utils';

export default function ClientDashboard() {
  const params = useParams();
  const token = params.token as string;
  
  const [evento, setEvento] = useState<any>(null);
  const [invitados, setInvitados] = useState<any[]>([]);
  const [regalos, setRegalos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg font-medium">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Evento no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            El link que estás usando no es válido o el evento ya no existe.
          </p>
          <a
            href="/"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const confirmados = invitados.filter(i => i.confirmado);
  const pendientes = invitados.filter(i => !i.confirmado);
  const regalosDisponibles = regalos.filter(r => r.stock > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">🎉 {evento.nombre}</h1>
          <p className="text-pink-100 mt-1">Panel de control del evento</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {[
            { id: 'resumen', label: '📊 Resumen', icon: '📊' },
            { id: 'invitados', label: `👥 Invitados (${invitados.length})`, icon: '👥' },
            { id: 'regalos', label: `🎁 Regalos (${regalos.length})`, icon: '🎁' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50'
                  : 'text-gray-600 hover:text-pink-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* TAB: RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-500 text-sm">Total Invitados</p>
                <p className="text-3xl font-bold text-gray-900">{invitados.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-500 text-sm">Confirmados</p>
                <p className="text-3xl font-bold text-green-600">{confirmados.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-500 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">{pendientes.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-500 text-sm">Regalos Disponibles</p>
                <p className="text-3xl font-bold text-pink-600">{regalosDisponibles.length}</p>
              </div>
            </div>

            {/* Info del evento */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Información del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Fecha</p>
                  <p className="text-gray-900 font-semibold">
                    {evento.configuracion?.fecha ? formatDateSpanish(evento.configuracion.fecha) : 'Por definir'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Hora</p>
                  <p className="text-gray-900 font-semibold">
                    {evento.configuracion?.hora ? format12Hour(evento.configuracion.hora) : 'Por definir'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-sm mb-1">Lugar</p>
                  <p className="text-gray-900 font-semibold">
                    {evento.configuracion?.lugar || 'Por definir'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INVITADOS */}
        {activeTab === 'invitados' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b bg-pink-50">
              <h3 className="text-xl font-bold text-gray-900">Lista de Invitados</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold">#</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Regalo</th>
                  </tr>
                </thead>
                <tbody>
                  {invitados.map((invitado, index) => (
                    <tr key={invitado.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{invitado.nombre}</td>
                      <td className="px-6 py-4">
                        {invitado.confirmado ? (
                          <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">✅ Confirmado</span>
                        ) : (
                          <span className="text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">⏳ Pendiente</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {invitado.regaloSeleccionado ? (
                          <span className="text-pink-600 font-medium bg-pink-50 px-3 py-1 rounded-full">
                            🎁 {getGiftName(invitado.regaloSeleccionado)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: REGALOS */}
        {activeTab === 'regalos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b bg-pink-50">
                <h3 className="text-xl font-bold text-gray-900">🎁 Lista de Regalos</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {regalos.map((regalo) => {
                  const disponible = regalo.stock > 0;
                  return (
                    <div key={regalo.id} className={`border-2 rounded-lg p-4 ${disponible ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">{regalo.nombre}</h4>
                        {!disponible && (
                          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">No disponible</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{regalo.descripcion}</p>
                      <p className={`font-bold mt-2 ${disponible ? 'text-green-600' : 'text-red-500'}`}>
                        📦 Stock: {regalo.stock}
                      </p>
                    </div>
                  );
                })}
                {regalos.length === 0 && (
                  <p className="text-gray-500 text-center col-span-2 py-4">No hay regalos registrados</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="text-center text-gray-600 text-sm">
          Hecho con 💕 para celebrar momentos especiales
        </div>
      </footer>
    </div>
  );
}