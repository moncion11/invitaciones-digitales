// src/components/GuestsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  eventId: string | null;
}

export default function GuestsManager({ eventId }: Props) {
  const [guests, setGuests] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchGuests();
    }
  }, [eventId]);

  const fetchGuests = async () => {
    if (!eventId) return;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'eventos', eventId, 'invitados'));
      const guestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGuests(guestsList);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !newGuestName.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'eventos', eventId, 'invitados'), {
        nombre: newGuestName,
        confirmado: false,
        regaloSeleccionado: null,
        fechaCreacion: new Date().toISOString(),
      });

      setNewGuestName('');
      setShowForm(false);
      fetchGuests();
      alert('✅ Invitado creado exitosamente');
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('❌ Error al crear invitado');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?inv=${token}`;
    navigator.clipboard.writeText(link);
    alert(`📋 Link copiado al portapapeles:\n\n${link}`);
  };

  const deleteGuest = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este invitado? Esta acción no se puede deshacer.')) return;
    if (!eventId) return;
    
    try {
      await deleteDoc(doc(db, 'eventos', eventId, 'invitados', id));
      fetchGuests();
      alert('✅ Invitado eliminado');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('❌ Error al eliminar');
    }
  };

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-600 text-lg">Selecciona un evento para gestionar invitados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">👥 Gestionar Invitados</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md"
        >
          + Agregar Invitado
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">Nuevo Invitado</h3>
          <form onSubmit={addGuest} className="space-y-5">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">Nombre completo</label>
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                placeholder="Ej: María González"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 font-semibold shadow-md"
              >
                {loading ? 'Guardando...' : '💾 Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de invitados */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Regalo</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Link</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-medium">{guest.nombre}</td>
                  <td className="px-6 py-4">
                    {guest.confirmado ? (
                      <span className="text-green-600 font-semibold flex items-center gap-2">
                        <span className="text-xl">✅</span> Confirmado
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold flex items-center gap-2">
                        <span className="text-xl">⏳</span> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {guest.regaloSeleccionado ? (
                      <span className="text-pink-600 font-semibold flex items-center gap-2">
                        <span className="text-xl">🎁</span> Seleccionado
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyLink(guest.id)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium text-sm"
                    >
                      📋 Copiar Link
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                    >
                      <span>🗑️</span> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {guests.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-lg">No hay invitados registrados</p>
            <p className="text-sm mt-2">Haz clic en "Agregar Invitado" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}