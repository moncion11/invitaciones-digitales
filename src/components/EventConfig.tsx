// src/components/EventConfig.tsx
'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  eventId: string | null;
}

export default function EventConfig({ eventId }: Props) {
  const [config, setConfig] = useState({
    fecha: '',
    hora: '',
    lugar: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchConfig();
    }
  }, [eventId]);

  const fetchConfig = async () => {
    if (!eventId) return;
    
    try {
      const docRef = doc(db, 'eventos', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          fecha: data?.configuracion?.fecha || '',
          hora: data?.configuracion?.hora || '',
          lugar: data?.configuracion?.lugar || '',
          mensaje: data?.configuracion?.mensaje || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    
    setLoading(true);
    
    try {
      await setDoc(doc(db, 'eventos', eventId), {
        configuracion: config,
      }, { merge: true });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('✅ Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">⚙️</p>
        <p className="text-gray-600 text-lg">Selecciona un evento para configurar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">⚙️ Configuración del Evento</h2>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={saveConfig} className="space-y-6">
          <div>
            <label className="block text-gray-900 font-semibold mb-2">📅 Fecha del evento</label>
            <input
              type="date"
              value={config.fecha}
              onChange={(e) => setConfig({ ...config, fecha: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-semibold mb-2">🕒 Hora del evento</label>
            <input
              type="time"
              value={config.hora}
              onChange={(e) => setConfig({ ...config, hora: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-semibold mb-2">📍 Lugar del evento</label>
            <input
              type="text"
              value={config.lugar}
              onChange={(e) => setConfig({ ...config, lugar: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
              placeholder="Ej: Salón de Eventos Celestial, Av. Principal #123"
            />
          </div>

          <div>
            <label className="block text-gray-900 font-semibold mb-2">💌 Mensaje de bienvenida</label>
            <textarea
              value={config.mensaje}
              onChange={(e) => setConfig({ ...config, mensaje: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
              placeholder="Ej: Nos haría muy feliz contar con tu presencia para celebrar la llegada de nuestro bebé..."
              rows={4}
            />
          </div>

          <div className="flex gap-4 items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg transition disabled:opacity-50 font-semibold shadow-md"
            >
              {loading ? '💾 Guardando...' : '💾 Guardar Configuración'}
            </button>
            
            {saved && (
              <span className="text-green-600 font-semibold flex items-center gap-2 text-lg">
                <span className="text-xl">✅</span> ¡Guardado!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span> Tips de Configuración
        </h3>
        <ul className="text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Esta configuración se mostrará en la invitación de <strong>todos los invitados</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Los cambios se reflejan <strong>inmediatamente</strong> en todas las invitaciones</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Puedes editar esta información <strong>cuantas veces quieras</strong></span>
          </li>
        </ul>
      </div>
    </div>
  );
}