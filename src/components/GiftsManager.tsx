// src/components/GiftsManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  eventId: string | null;
}

export default function GiftsManager({ eventId }: Props) {
  const [gifts, setGifts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: 1,
  });

  useEffect(() => {
    if (eventId) {
      fetchGifts();
    }
  }, [eventId]);

  const fetchGifts = async () => {
    if (!eventId) return;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'eventos', eventId, 'regalos'));
      const giftsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGifts(giftsList);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    
    try {
      if (editingGift) {
        await updateDoc(doc(db, 'eventos', eventId, 'regalos', editingGift.id), {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          stock: parseInt(formData.stock.toString()),
          disponible: parseInt(formData.stock.toString()) > 0,
        });
        alert('✅ Regalo actualizado');
      } else {
        await addDoc(collection(db, 'eventos', eventId, 'regalos'), {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          stock: parseInt(formData.stock.toString()),
          disponible: parseInt(formData.stock.toString()) > 0,
        });
        alert('✅ Regalo creado');
      }

      resetForm();
      fetchGifts();
    } catch (error) {
      console.error('Error saving gift:', error);
      alert('❌ Error al guardar');
    }
  };

  const editGift = (gift: any) => {
    setEditingGift(gift);
    setFormData({
      nombre: gift.nombre,
      descripcion: gift.descripcion,
      stock: gift.stock,
    });
    setShowForm(true);
  };

  const deleteGift = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este regalo?')) return;
    if (!eventId) return;
    
    try {
      await deleteDoc(doc(db, 'eventos', eventId, 'regalos', id));
      fetchGifts();
      alert('✅ Regalo eliminado');
    } catch (error) {
      console.error('Error deleting gift:', error);
      alert('❌ Error al eliminar');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGift(null);
    setFormData({ nombre: '', descripcion: '', stock: 1 });
  };

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎁</p>
        <p className="text-gray-600 text-lg">Selecciona un evento para gestionar regalos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">🎁 Gestionar Regalos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md"
        >
          + Agregar Regalo
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">
            {editingGift ? '✏️ Editar Regalo' : '🎁 Nuevo Regalo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-900 font-semibold mb-2">Nombre del regalo</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                placeholder="Ej: Silla de Auto"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                placeholder="Ej: Marca X, color gris, talla única"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-900 font-semibold mb-2">Stock (cantidad)</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                min="0"
                required
              />
              <p className="text-sm text-gray-600 mt-1">💡 Si es 0, el regalo aparecerá como "Agotado"</p>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md"
              >
                {editingGift ? '💾 Actualizar' : '💾 Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de regalos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Descripción</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Stock</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                <th className="px-6 py-4 text-left text-gray-900 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => (
                <tr key={gift.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-semibold">{gift.nombre}</td>
                  <td className="px-6 py-4 text-gray-700">{gift.descripcion}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${gift.stock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {gift.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {gift.disponible ? (
                      <span className="text-green-600 font-semibold flex items-center gap-2">
                        <span className="text-xl">✅</span> Disponible
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-2">
                        <span className="text-xl">🚫</span> Agotado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => editGift(gift)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <span>✏️</span> Editar
                      </button>
                      <button
                        onClick={() => deleteGift(gift.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                      >
                        <span>🗑️</span> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gifts.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-4xl mb-3">🎁</p>
            <p className="text-lg">No hay regalos registrados</p>
            <p className="text-sm mt-2">Haz clic en "Agregar Regalo" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}