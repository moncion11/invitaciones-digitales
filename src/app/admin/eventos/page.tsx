// src/app/admin/eventos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useModal } from '@/components/Modal';

interface Evento {
  id?: string;
  nombre: string;
  tituloPrincipal: string;
  subtitulo: string;
  token: string;
  diseño: string;
  configuracion: {
    fecha?: string;
    hora?: string;
    lugar?: string;
    mapaUrl?: string;
    mensaje?: string;
    personalizada?: {
      nombreBebe?: string;
      padres?: string;
      genero?: string;
      versiculo?: string;
    };
  };
  plantillaId?: string;
  activo: boolean;
  fechaCreacion?: any;
}

export default function EventosPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const [activeView, setActiveView] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [nombre, setNombre] = useState('');
  const [tituloPrincipal, setTituloPrincipal] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [diseño, setDiseño] = useState('rosa-clasico');
  const [plantillaId, setPlantillaId] = useState('');
  const [plantillas, setPlantillas] = useState<any[]>([]);
  
  // ✅ Campos de configuración
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('');
  const [mapaUrl, setMapaUrl] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nombreBebe, setNombreBebe] = useState('');
  const [padres, setPadres] = useState('');
  const [genero, setGenero] = useState('');
  const [versiculo, setVersiculo] = useState('');

  useEffect(() => {
    fetchEventos();
    fetchPlantillas();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'eventos'));
      const eventosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(eventosList as Evento[]);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      showAlert('Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlantillas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'plantillas'));
      const plantillasList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlantillas(plantillasList);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setNombre('');
    setTituloPrincipal('¡Baby Shower!');
    setSubtitulo('Estás invitado a celebrar');
    setDiseño('rosa-clasico');
    setPlantillaId('');
    setFecha('');
    setHora('');
    setLugar('');
    setMapaUrl('');
    setMensaje('');
    setNombreBebe('');
    setPadres('');
    setGenero('');
    setVersiculo('');
    setActiveView('crear');
  };

  const handleEdit = (evento: Evento) => {
    setSelectedEvent(evento);
    setNombre(evento.nombre);
    setTituloPrincipal(evento.tituloPrincipal);
    setSubtitulo(evento.subtitulo);
    setDiseño(evento.diseño || 'rosa-clasico');
    setPlantillaId(evento.plantillaId || '');
    setFecha(evento.configuracion?.fecha || '');
    setHora(evento.configuracion?.hora || '');
    setLugar(evento.configuracion?.lugar || '');
    setMapaUrl(evento.configuracion?.mapaUrl || '');
    setMensaje(evento.configuracion?.mensaje || '');
    setNombreBebe(evento.configuracion?.personalizada?.nombreBebe || '');
    setPadres(evento.configuracion?.personalizada?.padres || '');
    setGenero(evento.configuracion?.personalizada?.genero || '');
    setVersiculo(evento.configuracion?.personalizada?.versiculo || '');
    setActiveView('editar');
  };

  const handleSave = async () => {
    if (!nombre || !tituloPrincipal) {
      showAlert('Por favor completa el nombre y título del evento', 'warning');
      return;
    }

    showConfirm('¿Estás seguro de guardar este evento?', async () => {
      setSaving(true);
      try {
        const eventData: Partial<Evento> = {
          nombre,
          tituloPrincipal,
          subtitulo,
          diseño,
          plantillaId,
          configuracion: {
            fecha,
            hora,
            lugar,
            mapaUrl,
            mensaje,
            personalizada: {
              nombreBebe,
              padres,
              genero,
              versiculo,
            },
          },
          activo: true,
        };

        if (selectedEvent?.id) {
          await updateDoc(doc(db, 'eventos', selectedEvent.id), eventData);
          showAlert('Evento actualizado correctamente', 'success');
        } else {
          eventData.token = Math.random().toString(36).substring(2, 15);
          eventData.fechaCreacion = Timestamp.now();
          await addDoc(collection(db, 'eventos'), eventData);
          showAlert('Evento creado correctamente', 'success');
        }

        setActiveView('lista');
        fetchEventos();
      } catch (error) {
        console.error('Error al guardar evento:', error);
        showAlert('Error al guardar evento: ' + (error as Error).message, 'error');
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDelete = (id: string, nombre: string) => {
    showConfirm(`¿Estás seguro de eliminar el evento "${nombre}"?`, async () => {
      try {
        await deleteDoc(doc(db, 'eventos', id));
        showAlert('Evento eliminado', 'success');
        fetchEventos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showAlert('Error al eliminar evento', 'error');
      }
    });
  };

  const handleGenerarMapaUrl = () => {
    if (!lugar) {
      showAlert('Primero escribe la dirección del lugar', 'warning');
      return;
    }
    const encodedAddress = encodeURIComponent(lugar);
    const generatedUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    setMapaUrl(generatedUrl);
    showAlert('Link de Google Maps generado', 'success');
  };

  const diseños = [
    { id: 'rosa-clasico', nombre: '🌸 Rosa Clásico' },
    { id: 'azul-bebe', nombre: '💙 Azul Bebé' },
    { id: 'dorado-lujo', nombre: '👑 Dorado Lujo' },
    { id: 'verde-natural', nombre: '🍃 Verde Natural' },
    { id: 'morado-magico', nombre: '💜 Morado Mágico' },
    { id: 'arcoiris', nombre: '🌈 Arcoíris' },
  ];

  if (activeView === 'crear' || activeView === 'editar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => setActiveView('lista')}
                className="text-purple-600 hover:text-purple-800 font-medium mb-2"
              >
                ← Volver a Eventos
              </button>
              <h1 className="text-4xl font-bold text-gray-900">
                {activeView === 'crear' ? '➕ Crear Nuevo Evento' : '✏️ Editar Evento'}
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Información Básica
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Baby Shower María"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Título Principal *
                  </label>
                  <input
                    type="text"
                    value={tituloPrincipal}
                    onChange={(e) => setTituloPrincipal(e.target.value)}
                    placeholder="Ej: ¡Baby Shower!"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-900 font-semibold mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    placeholder="Ej: Estás invitado a celebrar"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Diseño y Plantilla */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎨</span> Diseño y Plantilla
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Diseño
                  </label>
                  <select
                    value={diseño}
                    onChange={(e) => setDiseño(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  >
                    {diseños.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Plantilla Personalizada (opcional)
                  </label>
                  <select
                    value={plantillaId}
                    onChange={(e) => setPlantillaId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  >
                    <option value="">Sin plantilla</option>
                    {plantillas.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detalles del Evento */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📅</span> Detalles del Evento
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    📅 Fecha
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    🕐 Hora
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación y Mapa */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Ubicación y Mapa
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    📍 Lugar del Evento
                  </label>
                  <input
                    type="text"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    placeholder="Ej: Salón Los Ángeles, Av. Winston Churchill #123, Santo Domingo"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    🔗 Link de Google Maps (opcional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mapaUrl}
                      onChange={(e) => setMapaUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleGenerarMapaUrl}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition whitespace-nowrap"
                    >
                      🔗 Generar
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Si no pones un link, se generará automáticamente con la dirección del lugar
                  </p>
                </div>
              </div>
            </div>

            {/* Información Personalizada */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>👶</span> Información Personalizada
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Nombre del Bebé
                  </label>
                  <input
                    type="text"
                    value={nombreBebe}
                    onChange={(e) => setNombreBebe(e.target.value)}
                    placeholder="Ej: María"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Nombres de los Padres
                  </label>
                  <input
                    type="text"
                    value={padres}
                    onChange={(e) => setPadres(e.target.value)}
                    placeholder="Ej: Juan y María Pérez"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Género
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Niña">👧 Niña</option>
                    <option value="Niño">👦 Niño</option>
                    <option value="Gemelos">👶 Gemelos</option>
                    <option value="Sorpresa">❓ Sorpresa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Versículo
                  </label>
                  <input
                    type="text"
                    value={versiculo}
                    onChange={(e) => setVersiculo(e.target.value)}
                    placeholder="Ej: Salmos 127:3"
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-900 font-semibold mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Mensaje de bienvenida..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving || !nombre || !tituloPrincipal}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>💾 Guardar Evento</span>
                )}
              </button>
              <button
                onClick={() => setActiveView('lista')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Lista de Eventos
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/admin')}
              className="text-purple-600 hover:text-purple-800 font-medium mb-2"
            >
              ← Volver al Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-900">🎊 Gestión de Eventos</h1>
            <p className="text-gray-600 mt-2">Crea y gestiona los eventos de tus clientes</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg"
          >
            ➕ Crear Nuevo Evento
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600 text-lg">Cargando eventos...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay eventos aún</h2>
            <p className="text-gray-600 mb-6">Crea tu primer evento para comenzar</p>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg"
            >
              ➕ Crear Primer Evento
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{evento.tituloPrincipal}</h3>
                  <p className="text-purple-100">{evento.subtitulo}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{evento.nombre}</p>
                  
                  {evento.configuracion?.fecha && (
                    <p className="text-sm text-gray-600 mb-2">
                      📅 {evento.configuracion.fecha}
                    </p>
                  )}
                  {evento.configuracion?.lugar && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {evento.configuracion.lugar}
                    </p>
                  )}
                  {evento.configuracion?.personalizada?.nombreBebe && (
                    <p className="text-sm text-purple-600 font-semibold mb-4">
                      👶 {evento.configuracion.personalizada.nombreBebe}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      evento.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {evento.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                    <span className="text-xs text-gray-500">
                      🔗 {evento.token}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(evento)}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ✏️ Editar
                    </button>
                    <a
                      href={`/?evento=${evento.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition text-center"
                    >
                      👁️ Ver
                    </a>
                    <button
                      onClick={() => handleDelete(evento.id!, evento.nombre)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}