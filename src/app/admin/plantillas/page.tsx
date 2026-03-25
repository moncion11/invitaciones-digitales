// src/app/admin/plantillas/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plantilla, CustomTextField, createPlantilla, getPlantillas, updatePlantilla, deletePlantilla } from '@/lib/templates';
import TemplateUploader from '@/components/admin/TemplateUploader';
import TemplateConfigurator from '@/components/admin/TemplateConfigurator';
import { useModal } from '@/components/Modal';

// ✅ MODAL DE ÉXITO
const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-modal-in">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Guardado Exitoso!</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition"
      >
        Aceptar
      </button>
    </div>
  </div>
);

export default function PlantillasPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const [activeView, setActiveView] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ✅ ESTADOS PARA MODAL
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('baby-shower');
  const [descripcion, setDescripcion] = useState('');
  const [precioSugerido, setPrecioSugerido] = useState(1500);
  const [imagenBase64, setImagenBase64] = useState('');
  const [campos, setCampos] = useState<Plantilla['campos']>({});
  const [botones, setBotones] = useState<Plantilla['botones']>({});
  const [anchoPlantilla, setAnchoPlantilla] = useState(675);
  const [altoPlantilla, setAltoPlantilla] = useState(1200);
  const [camposPersonalizados, setCamposPersonalizados] = useState<CustomTextField[]>([]);

  useEffect(() => {
    fetchPlantillas();
  }, []);

  const fetchPlantillas = async () => {
    setLoading(true);
    try {
      const data = await getPlantillas();
      setPlantillas(data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      showAlert('Error al cargar plantillas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (base64: string) => {
    setImagenBase64(base64);
  };

  const handleConfigSave = (config: Partial<Plantilla>) => {
    if (config.campos) setCampos(config.campos);
    if (config.botones) setBotones(config.botones);
    if (config.anchoPlantilla) setAnchoPlantilla(config.anchoPlantilla);
    if (config.altoPlantilla) setAltoPlantilla(config.altoPlantilla);
    if (config.camposPersonalizados) {
      setCamposPersonalizados(config.camposPersonalizados);
    }
  };

  const handleCreate = () => {
    setSelectedPlantilla(null);
    setNombre('');
    setCategoria('baby-shower');
    setDescripcion('');
    setPrecioSugerido(1500);
    setImagenBase64('');
    setCampos({});
    setBotones({});
    setAnchoPlantilla(675);
    setAltoPlantilla(1200);
    setCamposPersonalizados([]);
    setActiveView('crear');
  };

  const handleEdit = (plantilla: Plantilla) => {
    setSelectedPlantilla(plantilla);
    setNombre(plantilla.nombre);
    setCategoria(plantilla.categoria);
    setDescripcion(plantilla.descripcion || '');
    setPrecioSugerido(plantilla.precioSugerido || 1500);
    setImagenBase64(plantilla.imagenFondo);
    setCampos(plantilla.campos || {});
    setBotones(plantilla.botones || {});
    setAnchoPlantilla(plantilla.anchoPlantilla || 675);
    setAltoPlantilla(plantilla.altoPlantilla || 1200);
    setCamposPersonalizados(plantilla.camposPersonalizados || []);
    setActiveView('editar');
  };

  const handleSave = async () => {
    if (!nombre || !imagenBase64) {
      showAlert('Por favor completa el nombre y sube una imagen', 'warning');
      return;
    }

    showConfirm('¿Estás seguro de guardar esta plantilla?', async () => {
      setSaving(true);
      try {
        const plantillaData: Partial<Plantilla> = {
          nombre,
          categoria,
          descripcion,
          precioSugerido,
          imagenFondo: imagenBase64,
          campos,
          botones,
          anchoPlantilla,
          altoPlantilla,
          camposPersonalizados,
          activa: true,
        };

        if (selectedPlantilla?.id) {
          await updatePlantilla(selectedPlantilla.id, plantillaData);
          setSuccessMessage('Plantilla actualizada correctamente');
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            setActiveView('lista');
            fetchPlantillas();
          }, 2000);
        } else {
          await createPlantilla(plantillaData as Plantilla);
          setSuccessMessage('Plantilla creada correctamente');
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            setActiveView('lista');
            fetchPlantillas();
          }, 2000);
        }
      } catch (error) {
        console.error('Error al guardar plantilla:', error);
        showAlert('Error al guardar plantilla: ' + (error as Error).message, 'error');
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDelete = (id: string, nombre: string) => {
    showConfirm(`¿Estás seguro de eliminar la plantilla "${nombre}"?`, async () => {
      try {
        await deletePlantilla(id);
        showAlert('Plantilla eliminada', 'success');
        fetchPlantillas();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showAlert('Error al eliminar plantilla', 'error');
      }
    });
  };

  const categorias = [
    { id: 'baby-shower', nombre: '👶 Baby Shower' },
    { id: 'cumpleanos', nombre: '🎂 Cumpleaños' },
    { id: 'bodas', nombre: '💒 Bodas' },
    { id: '15-anos', nombre: '👑 15 Años' },
    { id: 'graduacion', nombre: '🎓 Graduación' },
    { id: 'otros', nombre: '🎊 Otros' },
  ];

  if (activeView === 'crear' || activeView === 'editar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => setActiveView('lista')}
                className="text-purple-600 hover:text-purple-800 font-medium mb-2"
              >
                ← Volver a Plantillas
              </button>
              <h1 className="text-4xl font-bold text-gray-900">
                {activeView === 'crear' ? '➕ Crear Nueva Plantilla' : '✏️ Editar Plantilla'}
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Baby Shower Osito Beige"
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Categoría *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Precio Sugerido (RD$)
                </label>
                <input
                  type="number"
                  value={precioSugerido}
                  onChange={(e) => setPrecioSugerido(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-semibold mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe la plantilla..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold resize-none"
              />
            </div>

            <div className="mb-6">
              <TemplateUploader
                onImageUploaded={handleImageUploaded}
                existingImage={imagenBase64}
              />
            </div>
          </div>

          {imagenBase64 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <TemplateConfigurator
                previewImage={imagenBase64}
                plantilla={selectedPlantilla || undefined}
                onSave={handleConfigSave}
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !nombre || !imagenBase64}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>💾 Guardar Plantilla</span>
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

        {/* ✅ MODAL DE ÉXITO */}
        {showSuccessModal && (
          <SuccessModal 
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </div>
    );
  }

  // Vista: Lista de Plantillas
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
            <h1 className="text-4xl font-bold text-gray-900">🎨 Gestión de Plantillas</h1>
            <p className="text-gray-600 mt-2">Crea y edita plantillas personalizadas para invitaciones</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg"
          >
            ➕ Crear Nueva Plantilla
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600 text-lg">Cargando plantillas...</p>
          </div>
        ) : plantillas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay plantillas aún</h2>
            <p className="text-gray-600 mb-6">Crea tu primera plantilla para comenzar</p>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition shadow-lg"
            >
              ➕ Crear Primera Plantilla
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantillas.map((plantilla) => (
              <div
                key={plantilla.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={plantilla.imagenFondo}
                  alt={plantilla.nombre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {plantilla.categoria}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      plantilla.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {plantilla.activa ? '✅ Activa' : '❌ Inactiva'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plantilla.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-2">{plantilla.descripcion || 'Sin descripción'}</p>
                  
                  {plantilla.anchoPlantilla && plantilla.altoPlantilla && (
                    <p className="text-xs text-gray-500 mb-2">
                      📐 {plantilla.anchoPlantilla} x {plantilla.altoPlantilla} px
                    </p>
                  )}
                  
                  {plantilla.camposPersonalizados && plantilla.camposPersonalizados.length > 0 && (
                    <p className="text-xs text-blue-600 mb-2">
                      ✏️ {plantilla.camposPersonalizados.length} campo(s) personalizado(s)
                    </p>
                  )}
                  
                  <p className="text-purple-600 font-bold mb-4">RD$ {plantilla.precioSugerido || 0}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plantilla)}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plantilla.id!, plantilla.nombre)}
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