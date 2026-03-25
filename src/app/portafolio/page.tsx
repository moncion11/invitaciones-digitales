// src/app/portafolio/page.tsx
'use client';
import { useState } from 'react';
import PortfolioPreviewModal from '@/components/PortfolioPreviewModal';

const diseños = [
  {
    id: 'rosa-clasico',
    nombre: 'Rosa Clásico',
    descripcion: 'Elegante y tierno con tonos rosados y detalles en dorado',
    precio: 'Desde RD$ 1,500',
    icono: '🎀',
    colores: ['from-pink-400', 'to-pink-600'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo'],
    categorias: ['baby', 'cumpleanos', 'bodas', '15-anos'],
  },
  {
    id: 'azul-bebe',
    nombre: 'Azul Bebé',
    descripcion: 'Fresco y moderno con tonos azules y celestes',
    precio: 'Desde RD$ 1,500',
    icono: '⭐',
    colores: ['from-blue-400', 'to-cyan-600'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo'],
    categorias: ['baby', 'cumpleanos', 'graduacion', 'corporativo'],
  },
  {
    id: 'dorado-lujo',
    nombre: 'Dorado Lujo',
    descripcion: 'Premium y sofisticado con acabados dorados',
    precio: 'Desde RD$ 2,000',
    icono: '👑',
    colores: ['from-yellow-400', 'to-amber-600'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo', 'Soporte prioritario'],
    categorias: ['bodas', '15-anos', 'graduacion', 'corporativo', 'aniversario'],
  },
  {
    id: 'verde-natural',
    nombre: 'Verde Natural',
    descripcion: 'Orgánico y fresco con tonos de naturaleza',
    precio: 'Desde RD$ 1,500',
    icono: '🍃',
    colores: ['from-green-400', 'to-emerald-600'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo'],
    categorias: ['baby', 'graduacion', 'corporativo', 'memorial'],
  },
  {
    id: 'morado-magico',
    nombre: 'Morado Mágico',
    descripcion: 'Encantador y místico con tonos violetas',
    precio: 'Desde RD$ 1,500',
    icono: '🌟',
    colores: ['from-purple-400', 'to-violet-600'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo'],
    categorias: ['15-anos', 'cumpleanos', 'bodas'],
  },
  {
    id: 'arcoiris',
    nombre: 'Arcoíris',
    descripcion: 'Alegre y colorido con todos los tonos',
    precio: 'Desde RD$ 1,800',
    icono: '🎨',
    colores: ['from-pink-400', 'via-purple-400', 'to-blue-400'],
    caracteristicas: ['Invitación digital', 'Confirmación de asistencia', 'Lista de regalos', 'Diseño responsivo'],
    categorias: ['baby', 'cumpleanos', 'despedida', 'navidad'],
  },
];

const categorias = [
  { id: 'todos', nombre: '✨ Todos', icono: '🎨' },
  { id: 'baby', nombre: '👶 Baby', icono: '🧸' },
  { id: 'cumpleanos', nombre: '🎂 Cumpleaños', icono: '🎈' },
  { id: 'bodas', nombre: '💒 Bodas', icono: '💍' },
  { id: '15-anos', nombre: '👑 15 Años', icono: '👸' },
  { id: 'graduacion', nombre: '🎓 Graduación', icono: '🎓' },
  { id: 'corporativo', nombre: '🏢 Corporativo', icono: '👔' },
  { id: 'otros', nombre: '🎊 Otros', icono: '🎉' },
];

const WHATSAPP_NUMBER = '18293697838'; // ⚠️ CAMBIA POR TU NÚMERO

export default function PortafolioPage() {
  const [previewDesign, setPreviewDesign] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    diseño: '',
    mensaje: '',
  });

  const handleOpenPreview = (designId: string) => {
    setPreviewDesign(designId);
    setIsModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsModalOpen(false);
    setTimeout(() => setPreviewDesign(null), 300);
  };

  const handleSelectDesign = (designId: string) => {
    const diseño = diseños.find(d => d.id === designId);
    const mensaje = `¡Hola! 👋 Me interesa el diseño *${diseño?.nombre}* de InvitaDigital.

💰 Precio: ${diseño?.precio}

Me gustaría más información sobre:
- Personalización del diseño
- Tiempo de entrega
- Formas de pago

¡Gracias! 🎉`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mensaje = `¡Hola! 👋 Quiero cotizar una invitación digital en InvitaDigital

📋 Datos de contacto:
• Nombre: ${formData.nombre}
• Email: ${formData.email}
• Teléfono: ${formData.telefono}
• Diseño de interés: ${formData.diseño || 'No especificado'}

💬 Mensaje: ${formData.mensaje}

¡Gracias! 🎉`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setShowContactForm(false);
    setFormData({ nombre: '', email: '', telefono: '', diseño: '', mensaje: '' });
  };

  const diseñosFiltrados = categoriaActiva === 'todos' 
    ? diseños 
    : diseños.filter(d => d.categorias?.includes(categoriaActiva));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 shadow-xl">
          <div className="container mx-auto px-4 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              InvitaDigital
            </h1>
            <p className="text-2xl text-white/95 font-semibold mb-4">
              Invitaciones Digitales para Todo Tipo de Evento
            </p>
            <p className="text-xl text-white/85 max-w-3xl mx-auto">
              Baby Shower • Cumpleaños • Bodas • 15 Años • Graduación • Corporativos y más
            </p>
          </div>
        </header>

        {/* Precios por Categoría */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-2 border-purple-100">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              💰 Precios por Tipo de Evento
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200 hover:shadow-lg transition">
                <div className="text-5xl mb-3">👶</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Baby</h3>
                <p className="text-2xl font-bold text-pink-600 mb-2">RD$ 1,500</p>
                <p className="text-sm text-gray-600">Baby Shower, Reveal, Bautizo</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition">
                <div className="text-5xl mb-3">🎂</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Cumpleaños</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">RD$ 1,500 - 2,500</p>
                <p className="text-sm text-gray-600">Niños, Adultos, 15 Años</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition">
                <div className="text-5xl mb-3">💒</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Bodas</h3>
                <p className="text-2xl font-bold text-purple-600 mb-2">RD$ 3,500 - 5,000</p>
                <p className="text-sm text-gray-600">Boda, Bridal Shower, Aniversario</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition">
                <div className="text-5xl mb-3">🎓</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Graduación</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-2">RD$ 1,500 - 2,000</p>
                <p className="text-sm text-gray-600">Universidad, Escuela, Curso</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-2 border-purple-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">100% Digital</h3>
                <p className="text-gray-600">Envía tu invitación por WhatsApp, email o redes sociales</p>
              </div>
              <div>
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmación Fácil</h3>
                <p className="text-gray-600">Tus invitados confirman asistencia con un solo clic</p>
              </div>
              <div>
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lista de Regalos</h3>
                <p className="text-gray-600">Gestiona los regalos de forma inteligente</p>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`px-6 py-3 rounded-full font-semibold transition transform hover:scale-105 shadow-md ${
                  categoriaActiva === categoria.id
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {categoria.icono} {categoria.nombre}
              </button>
            ))}
          </div>

          {/* Designs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diseñosFiltrados.map((diseño) => (
              <div
                key={diseño.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-100"
              >
                <div className={`bg-gradient-to-r ${diseño.colores.join(' ')} p-8 text-center`}>
                  <div className="text-6xl mb-4 animate-bounce">{diseño.icono}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{diseño.nombre}</h3>
                  <p className="text-white/95 font-bold text-lg">{diseño.precio}</p>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-gray-700 text-center">{diseño.descripcion}</p>
                  
                  <ul className="space-y-2">
                    {diseño.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500 text-lg">✓</span>
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => handleOpenPreview(diseño.id)}
                      className={`w-full bg-gradient-to-r ${diseño.colores.join(' ')} hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-md`}
                    >
                      👁️ Ver Vista Previa
                    </button>
                    
                    <button
                      onClick={() => handleSelectDesign(diseño.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                    >
                      <span>📱</span> Contratar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Templates Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border-2 border-purple-100">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¿Quieres algo único?
              </h2>
              <p className="text-gray-600 text-lg">
                Creamos plantillas 100% personalizadas para tu evento
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-4xl mb-3">✏️</div>
                <h3 className="font-bold text-gray-900 mb-2">Diseño a tu Medida</h3>
                <p className="text-gray-600 text-sm">Envíanos tu idea, imagen o referencia y la convertimos en una invitación digital profesional</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-4xl mb-3">🖼️</div>
                <h3 className="font-bold text-gray-900 mb-2">Tu Propia Imagen</h3>
                <p className="text-gray-600 text-sm">¿Ya tienes el diseño hecho? Lo integramos con todas las funciones: confirmación, regalos y más</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-bold text-gray-900 mb-2">Plantilla HTML</h3>
                <p className="text-gray-600 text-sm">Diseño web interactivo con animaciones, fondos dinámicos y total libertad creativa</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-500 mb-4">Contáctanos para cotizar tu diseño personalizado</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! 👋 Me interesa una plantilla personalizada para mi evento en InvitaDigital')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                >
                  📱 Escribir por WhatsApp
                </a>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                >
                  📋 Llenar Formulario
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-center text-white border-4 border-white/20">
            <div className="text-6xl mb-4 animate-bounce">🎊</div>
            <h2 className="text-5xl font-bold mb-4">InvitaDigital</h2>
            <p className="text-2xl text-white/95 mb-4 font-semibold">
              ¿Listo para celebrar?
            </p>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Elige tu diseño favorito y comienza a crear la invitación perfecta para cualquier evento
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! 👋 Quiero información sobre las invitaciones digitales de InvitaDigital')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105 text-lg"
              >
                📱 Contactar por WhatsApp
              </a>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="bg-white text-purple-600 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-lg"
              >
                📋 Llenar Formulario
              </button>
            </div>
            <p className="text-white/80 mt-8 text-sm">
              ⚠️ El panel de administración es solo para uso interno
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-purple-100 mt-12 py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <p className="text-2xl font-bold text-gray-900 mb-2">InvitaDigital</p>
            <p className="text-gray-600 mb-4">Invitaciones Digitales para Todo Evento</p>
            <div className="flex justify-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <span>👶 Baby Shower</span>
              <span>🎂 Cumpleaños</span>
              <span>💒 Bodas</span>
              <span>👑 15 Años</span>
              <span>🎓 Graduación</span>
              <span>🏢 Corporativos</span>
            </div>
            <p className="text-gray-500 text-sm">
              Hecho con 💕 para celebrar momentos especiales
            </p>
            <p className="text-gray-400 text-xs mt-2">
              © {new Date().getFullYear()} InvitaDigital. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>

      {/* Preview Modal */}
      <PortfolioPreviewModal
        isOpen={isModalOpen}
        onClose={handleClosePreview}
        design={previewDesign || 'rosa-clasico'}
      />

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowContactForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 border-2 border-purple-200">
            <button
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📋</div>
              <h2 className="text-2xl font-bold text-gray-900">Formulario de Contacto</h2>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Diseño</label>
                <select
                  value={formData.diseño}
                  onChange={(e) => setFormData({ ...formData, diseño: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="">Selecciona un diseño</option>
                  {diseños.map(d => (
                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-md"
              >
                📱 Enviar por WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}