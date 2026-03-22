// src/components/Reports.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  eventId: string | null;
}

export default function Reports({ eventId }: Props) {
  const [guests, setGuests] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);

  useEffect(() => {
    if (eventId) {
      fetchReports();
    }
  }, [eventId]);

  const fetchReports = async () => {
    if (!eventId) return;
    
    try {
      const guestsSnapshot = await getDocs(collection(db, 'eventos', eventId, 'invitados'));
      const guestsList = guestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGuests(guestsList);

      const giftsSnapshot = await getDocs(collection(db, 'eventos', eventId, 'regalos'));
      const giftsList = giftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGifts(giftsList);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const confirmedGuests = guests.filter(g => g.confirmado);
  const pendingGuests = guests.filter(g => !g.confirmado);
  const selectedGifts = guests.filter(g => g.regaloSeleccionado);

  const getGiftName = (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    return gift ? gift.nombre : 'No especificado';
  };

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-600 text-lg">Selecciona un evento para ver reportes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">📋 Reportes y Estadísticas</h2>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-500">Total Invitados</p>
          <p className="text-3xl font-bold text-gray-900">{guests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-500">Confirmados</p>
          <p className="text-3xl font-bold text-green-600">{confirmedGuests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-500">Pendientes</p>
          <p className="text-3xl font-bold text-orange-600">{pendingGuests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-500">Regalos Seleccionados</p>
          <p className="text-3xl font-bold text-pink-600">{selectedGifts.length}</p>
        </div>
      </div>

      {/* Lista de Confirmados */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-green-50 border-b">
          <h3 className="text-lg font-bold text-green-900">✅ Invitados Confirmados</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Nombre</th>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Regalo Seleccionado</th>
            </tr>
          </thead>
          <tbody>
            {confirmedGuests.map((guest) => (
              <tr key={guest.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 font-medium">{guest.nombre}</td>
                <td className="px-6 py-4">
                  {guest.regaloSeleccionado ? (
                    <span className="text-pink-600 font-medium">🎁 {getGiftName(guest.regaloSeleccionado)}</span>
                  ) : (
                    <span className="text-gray-400">Aún no selecciona</span>
                  )}
                </td>
              </tr>
            ))}
            {confirmedGuests.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-gray-500">
                  No hay invitados confirmados aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lista de Pendientes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-orange-50 border-b">
          <h3 className="text-lg font-bold text-orange-900">⏳ Invitados Pendientes</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Nombre</th>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Link</th>
            </tr>
          </thead>
          <tbody>
            {pendingGuests.map((guest) => (
              <tr key={guest.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 font-medium">{guest.nombre}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?inv=${guest.id}`;
                      navigator.clipboard.writeText(link);
                      alert(`📋 Link copiado: ${link}`);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                  >
                    Copiar Link
                  </button>
                </td>
              </tr>
            ))}
            {pendingGuests.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-gray-500">
                  ¡Todos han confirmado!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock de Regalos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-pink-50 border-b">
          <h3 className="text-lg font-bold text-pink-900">🎁 Stock de Regalos</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Regalo</th>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Stock Actual</th>
              <th className="px-6 py-4 text-left text-gray-900 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((gift) => (
              <tr key={gift.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 font-medium">{gift.nombre}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold text-lg ${gift.stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {gift.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {gift.disponible ? (
                    <span className="text-green-600 font-semibold">✅ Disponible</span>
                  ) : (
                    <span className="text-red-600 font-semibold">🚫 Agotado</span>
                  )}
                </td>
              </tr>
            ))}
            {gifts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                  No hay regalos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}