// src/components/GiftsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImportGifts from './ImportGifts';
import { useModal } from './Modal';

interface Props {
  eventId: string;
}

interface Gift {
  id: string;
  nombre: string;
  precio?: string;
  stock: number;
  imagen?: string;
  disponible: boolean;
  ilimitado?: boolean;
  seleccionado?: boolean;
  orden?: number;  // ✅ Agregado: campo orden
}

export default function GiftsManager({ eventId }: Props) {
  const { showAlert, showConfirm } = useModal();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGifts();
  }, [eventId]);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const giftsRef = collection(db, 'eventos', eventId, 'regalos');
      const snapshot = await getDocs(giftsRef);
      const giftsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gift[];
      
      // ✅ Ordenar por campo 'orden' si existe
      const sortedGifts = giftsList.sort((a, b) => {
        const ordenA = a.orden ?? 999999;
        const ordenB = b.orden ?? 999999;
        return ordenA - ordenB;
      });
      
      setGifts(sortedGifts);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGift = (giftId: string, giftName: string) => {
    showConfirm(`¿Estás seguro de eliminar "${giftName}"?`, async () => {
      try {
        await deleteDoc(doc(db, 'eventos', eventId, 'regalos', giftId));
        showAlert('Regalo eliminado', 'success');
        setSelectedIds(prev => { const next = new Set(prev); next.delete(giftId); return next; });
        fetchGifts();
      } catch (error) {
        console.error('Error deleting gift:', error);
        showAlert('Error al eliminar regalo', 'error');
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    showConfirm(`¿Estás seguro de eliminar ${selectedIds.size} regalo(s)?`, async () => {
      setDeleting(true);
      try {
        const promises = Array.from(selectedIds).map(id =>
          deleteDoc(doc(db, 'eventos', eventId, 'regalos', id))
        );
        await Promise.all(promises);
        showAlert(`${selectedIds.size} regalo(s) eliminado(s)`, 'success');
        setSelectedIds(new Set());
        fetchGifts();
      } catch (error) {
        console.error('Error deleting gifts:', error);
        showAlert('Error al eliminar regalos', 'error');
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
    if (selectedIds.size === filteredGifts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGifts.map(g => g.id)));
    }
  };

  const handleToggleDisponibilidad = async (giftId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'eventos', eventId, 'regalos', giftId), {
        disponible: !currentStatus
      });
      showAlert('Disponibilidad actualizada', 'success');
      fetchGifts();
    } catch (error) {
      console.error('Error updating gift:', error);
      showAlert('Error al actualizar', 'error');
    }
  };

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAvailable === 'all' ||
                         (filterAvailable === 'available' && gift.disponible) ||
                         (filterAvailable === 'unavailable' && !gift.disponible);
    
    return matchesSearch && matchesFilter;
  });

  const availableCount = gifts.filter(g => g.disponible).length;
  const selectedCount = gifts.filter(g => g.seleccionado).length;

  return (
    <div className="space-y-6">
      {/* Header con Botones */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎁 Lista de Regalos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {gifts.length} regalos • {availableCount} disponibles • {selectedCount} seleccionados
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
            ➕ Agregar Regalo
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
              placeholder="Nombre del regalo..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📋 Filtrar por</label>
            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="all">Todos los regalos</option>
              <option value="available">✅ Disponibles</option>
              <option value="unavailable">❌ No disponibles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Regalos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600 text-lg">Cargando regalos...</p>
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay regalos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterAvailable !== 'all' 
              ? 'No hay resultados para tu búsqueda' 
              : 'Agrega tu primer regalo o importa desde Excel'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ➕ Agregar Regalo
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
        <>
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition text-sm border border-gray-300"
          >
            {selectedIds.size === filteredGifts.length && filteredGifts.length > 0 ? '☑️ Deseleccionar todos' : '☐ Seleccionar todos'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-gray-600">{selectedIds.size} seleccionado(s)</span>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => toggleSelect(gift.id)}
              className={`bg-white rounded-xl shadow-md p-6 border-2 transition cursor-pointer ${
                selectedIds.has(gift.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : gift.disponible 
                    ? 'border-purple-200 hover:shadow-lg' 
                    : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(gift.id)}
                    onChange={() => toggleSelect(gift.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-5xl">{gift.imagen || '🎁'}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  gift.disponible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {gift.disponible ? '✅ Disponible' : '❌ Agotado'}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-3">{gift.nombre}</h3>
              
              {/* Mostrar Stock */}
<div className="mb-4">
  {gift.ilimitado ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
      ♾️ Stock Ilimitado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
      📦 Stock: {gift.stock}
    </span>
  )}
</div>
              
              {gift.seleccionado && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-semibold">
                    🎯 Seleccionado por invitado
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleDisponibilidad(gift.id, gift.disponible); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    gift.disponible
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {gift.disponible ? '🚫 Marcar Agotado' : '✅ Marcar Disponible'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteGift(gift.id, gift.nombre); }}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Modal de Importación */}
      {showImportModal && (
        <ImportGifts
          eventId={eventId}
          onImportComplete={fetchGifts}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}