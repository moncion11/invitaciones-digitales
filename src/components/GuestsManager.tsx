// src/components/GuestsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImportGuests from './ImportGuests';
import { useModal } from './Modal';

interface Props {
  eventId: string;
}

interface Guest {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  familia?: string;
  confirmado: boolean;
  regaloSeleccionado?: string | null;
  fechaConfirmacion?: any;
  fechaCreacion?: any;
  tipo?: string;
}

export default function GuestsManager({ eventId }: Props) {
  const { showAlert, showConfirm } = useModal();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const guestsRef = collection(db, 'eventos', eventId, 'invitados');
      const snapshot = await getDocs(guestsRef);
      const guestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Guest[];
      setGuests(guestsList);
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = (guestId: string, guestName: string) => {
    showConfirm(`¿Estás seguro de eliminar a "${guestName}"?`, async () => {
      try {
        await deleteDoc(doc(db, 'eventos', eventId, 'invitados', guestId));
        showAlert('Invitado eliminado', 'success');
        setSelectedIds(prev => { const next = new Set(prev); next.delete(guestId); return next; });
        fetchGuests();
      } catch (error) {
        console.error('Error deleting guest:', error);
        showAlert('Error al eliminar invitado', 'error');
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    showConfirm(`¿Estás seguro de eliminar ${selectedIds.size} invitado(s)?`, async () => {
      setDeleting(true);
      try {
        const promises = Array.from(selectedIds).map(id =>
          deleteDoc(doc(db, 'eventos', eventId, 'invitados', id))
        );
        await Promise.all(promises);
        showAlert(`${selectedIds.size} invitado(s) eliminado(s)`, 'success');
        setSelectedIds(new Set());
        fetchGuests();
      } catch (error) {
        console.error('Error deleting guests:', error);
        showAlert('Error al eliminar invitados', 'error');
      } finally {
        setDeleting(false);
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map(g => g.id)));
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.telefono?.includes(searchTerm);
    
    const matchesFilter = filterConfirmed === 'all' ||
                         (filterConfirmed === 'confirmed' && guest.confirmado) ||
                         (filterConfirmed === 'pending' && !guest.confirmado);
    
    return matchesSearch && matchesFilter;
  });

  const confirmedCount = guests.filter(g => g.confirmado).length;
  const pendingCount = guests.filter(g => !g.confirmado).length;

  return (
    <div className="space-y-6">
      {/* Header con Botones */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 Invitados</h2>
          <p className="text-sm text-gray-600 mt-1">
            {guests.length} invitados • {confirmedCount} confirmados • {pendingCount} pendientes
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              🗑️ Eliminar ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md"
          >
            ➕ Agregar Invitado
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-md flex items-center gap-2"
          >
            📊 Importar Excel
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-md border-2 border-gray-200">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🔍 Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, email o teléfono..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📋 Filtrar por</label>
            <select
              value={filterConfirmed}
              onChange={(e) => setFilterConfirmed(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="all">Todos los invitados</option>
              <option value="confirmed">✅ Confirmados</option>
              <option value="pending">⏳ Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Invitados */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600 text-lg">Cargando invitados...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay invitados</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterConfirmed !== 'all' 
              ? 'No hay resultados para tu búsqueda' 
              : 'Agrega tu primer invitado o importa desde Excel'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ➕ Agregar Invitado
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              📊 Importar Excel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredGuests.length && filteredGuests.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Contacto</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Regalo</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className={`hover:bg-gray-50 transition ${selectedIds.has(guest.id) ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(guest.id)}
                        onChange={() => toggleSelect(guest.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{guest.nombre}</p>
                        {guest.familia && (
                          <p className="text-sm text-gray-500">👨‍👩‍👧‍👦 {guest.familia}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {guest.email && (
                          <p className="text-gray-600">📧 {guest.email}</p>
                        )}
                        {guest.telefono && (
                          <p className="text-gray-600">📱 {guest.telefono}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {guest.confirmado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ✅ Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                          ⏳ Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {guest.regaloSeleccionado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                          🎁 Seleccionado
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteGuest(guest.id, guest.nombre)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg transition text-sm font-medium"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Importación */}
      {showImportModal && (
        <ImportGuests
          eventId={eventId}
          onImportComplete={fetchGuests}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}