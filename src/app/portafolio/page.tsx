// src/app/portafolio/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

const diseños = [
  {
    id: 'rosa-clasico',
    nombre: 'Rosa Clásico',
    descripción: 'Elegante y tradicional con tonos rosas y púrpuras. Perfecto para baby showers clásicos.',
    colores: 'from-pink-300 to-purple-300',
    preview: '🎀',
    popular: true,
    características: ['Tipografía elegante', 'Degradado suave', 'Iconos decorativos'],
  },
  {
    id: 'azul-bebe',
    nombre: 'Azul Bebé',
    descripción: 'Dulce y suave en tonos azules. Ideal para celebrar la llegada de un niño.',
    colores: 'from-blue-300 to-cyan-300',
    preview: '👶',
    popular: false,
    características: ['Tonos relajantes', 'Diseño minimalista', 'Fácil lectura'],
  },
  {
    id: 'dorado-lujo',
    nombre: 'Dorado Lujo',
    descripción: 'Elegante y sofisticado con detalles dorados. Para eventos premium.',
    colores: 'from-yellow-300 to-amber-400',
    preview: '✨',
    popular: true,
    características: ['Acabado premium', 'Detalles brillantes', 'Estilo exclusivo'],
  },
  {
    id: 'verde-natural',
    nombre: 'Verde Natural',
    descripción: 'Fresco y orgánico. Perfecto para baby showers al aire libre o temáticos.',
    colores: 'from-green-300 to-emerald-400',
    preview: '🌿',
    popular: false,
    características: ['Estilo natural', 'Colores tierra', 'Ambiente relajado'],
  },
  {
    id: 'morado-magico',
    nombre: 'Morado Mágico',
    descripción: 'Encantador y único. Para mamás que buscan algo diferente y especial.',
    colores: 'from-purple-300 to-violet-400',
    preview: '🦄',
    popular: false,
    características: ['Toque mágico', 'Colores vibrantes', 'Diseño único'],
  },
  {
    id: 'arcoiris',
    nombre: 'Arcoíris',
    descripción: 'Alegre y colorido. Para celebrar con toda la energía y felicidad.',
    colores: 'from-pink-400 via-purple-400 to-blue-400',
    preview: '🌈',
    popular: true,
    características: ['Multicolor', 'Energía positiva', 'Divertido'],
  },
];

const precios = [
  {
    nombre: 'Básico',
    precio: '$49 USD',
    incluye: [
      '1 evento',
      'Hasta 50 invitados',
      '10 regalos en lista',
      'Diseño estándar',
      'Soporte por email',
    ],
    destacado: false,
  },
  {
    nombre: 'Premium',
    precio: '$99 USD',
    incluye: [
      '1 evento',
      'Invitados ilimitados',
      'Regalos ilimitados',
      'Cualquier diseño',
      'Mensaje personalizado',
      'Soporte prioritario',
    ],
    destacado: true,
  },
  {
    nombre: 'VIP',
    precio: '$199 USD',
    incluye: [
      'Todo lo de Premium',
      'Recordatorios automáticos',
      'Código QR personalizado',
      'Reporte de confirmados en PDF',
      'Cambios ilimitados',
      'Soporte 24/7',
    ],
    destacado: false,
  },
];

export default function PortafolioPage() {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-pink-500">
            🎉 BabyInvites
          </Link>
          <nav className="hidden md:flex gap-6">
            <a href="#diseños" className="text-gray-600 hover:text-pink-500 transition">Diseños</a>
            <a href="#precios" className="text-gray-600 hover:text-pink-500 transition">Precios</a>
            <a href="#contacto" className="text-gray-600 hover:text-pink-500 transition">Contacto</a>
          </nav>
          <button
            onClick={() => setShowContactForm(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            Contratar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Invitaciones Digitales para <span className="text-pink-500">Baby Shower</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Crea invitaciones hermosas con confirmación de asistencia, lista de regalos en tiempo real y dashboard para los organizadores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#diseños"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition transform hover:scale-105"
            >
              Ver Diseños
            </a>
            <Link
              href="/admin"
              className="bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              Ya tengo cuenta →
            </Link>
          </div>
        </div>
      </section>

      {/* Diseños Section */}
      <section id="diseños" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            🎨 Nuestros Diseños
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Elige el estilo perfecto para tu celebración
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diseños.map((diseño) => (
              <div
                key={diseño.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 border-2 ${
                  selectedDesign === diseño.id ? 'border-pink-500 ring-4 ring-pink-200' : 'border-transparent'
                }`}
                onClick={() => setSelectedDesign(diseño.id)}
              >
                {/* Preview */}
                <div className={`h-48 bg-gradient-to-r ${diseño.colores} flex items-center justify-center relative`}>
                  <span className="text-7xl">{diseño.preview}</span>
                  {diseño.popular && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Popular
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{diseño.nombre}</h3>
                  <p className="text-gray-600 mb-4">{diseño.descripción}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {diseño.características.map((car, i) => (
                      <span key={i} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                        {car}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDesign(diseño.id);
                      setShowContactForm(true);
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      selectedDesign === diseño.id
                        ? 'bg-green-500 text-white'
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {selectedDesign === diseño.id ? '✅ Seleccionado' : 'Elegir este diseño'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios Section */}
      <section id="precios" className="py-16 px-6 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            💰 Planes y Precios
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Inversión única por evento. Sin mensualidades.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {precios.map((plan) => (
              <div
                key={plan.nombre}
                className={`bg-white rounded-2xl p-8 ${
                  plan.destacado 
                    ? 'shadow-2xl border-4 border-pink-500 relative' 
                    : 'shadow-lg border border-gray-200'
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Más Popular
                  </span>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
                <p className="text-4xl font-bold text-pink-500 mb-6">{plan.precio}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.incluye.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500">✅</span>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setShowContactForm(true)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.destacado
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Contratar {plan.nombre}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            🚀 ¿Cómo Funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { paso: 1, icono: '📝', título: 'Contáctanos', desc: 'Elige tu diseño y plan' },
              { paso: 2, icono: '🎨', título: 'Personalizamos', desc: 'Agregamos tu información' },
              { paso: 3, icono: '🔗', título: 'Recibes links', desc: 'Para invitados y dashboard' },
              { paso: 4, icono: '🎉', título: '¡A celebrar!', desc: 'Nosotros nos encargamos del resto' },
            ].map((item) => (
              <div key={item.paso} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icono}
                </div>
                <p className="text-sm font-bold text-pink-500 mb-2">Paso {item.paso}</p>
                <h4 className="font-bold text-gray-900 mb-2">{item.título}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barra inferior cuando se selecciona diseño */}
      {selectedDesign && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-6 border-t z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-gray-600">Diseño seleccionado:</p>
              <p className="text-xl font-bold text-gray-900">
                {diseños.find(d => d.id === selectedDesign)?.nombre}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedDesign(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowContactForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg"
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacto Modal */}
{showContactForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative border-2 border-pink-200">
      <button
        onClick={() => setShowContactForm(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold"
      >
        ×
      </button>
      
      <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-3xl">🎉</span> ¡Empecemos!
      </h3>
      
      <form className="space-y-5" onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const mensaje = `Hola, quiero contratar una invitación:%0A%0ADiseño: ${selectedDesign || 'Por definir'}%0ANombre: ${formData.get('nombre')}%0AWhatsApp: ${formData.get('whatsapp')}%0AFecha evento: ${formData.get('fecha')}`;
        window.open(`https://wa.me/18293697838?text=${mensaje}`, '_blank');
      }}>
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-lg">
            Tu nombre *
          </label>
          <input
            name="nombre"
            type="text"
            required
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 font-medium placeholder-gray-500"
            placeholder="María González"
          />
        </div>
        
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-lg">
            WhatsApp *
          </label>
          <input
            name="whatsapp"
            type="tel"
            required
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 font-medium placeholder-gray-500"
            placeholder="829-123-4567"
          />
        </div>
        
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-lg">
            Fecha del evento
          </label>
          <input
            name="fecha"
            type="date"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 font-medium"
          />
        </div>
        
        {selectedDesign && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-5 rounded-lg border-2 border-pink-300">
            <p className="text-gray-900 font-bold">
              Diseño seleccionado: <span className="text-pink-600 font-bold text-lg">{diseños.find(d => d.id === selectedDesign)?.nombre}</span>
            </p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition shadow-lg text-lg"
        >
          📱 Contactar por WhatsApp
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-700 font-medium mb-2">
          O escríbenos directamente:
        </p>
        <a 
          href="https://wa.me/18293697838" 
          className="text-pink-600 hover:text-pink-800 font-bold underline text-lg" 
          target="_blank"
          rel="noopener noreferrer"
        >
          wa.me/18293697838
        </a>
      </div>
    </div>
  </div>
)}
      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">🎉 BabyInvites</h4>
              <p className="text-gray-400">
                Invitaciones digitales hermosas para celebrar momentos especiales.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#diseños" className="hover:text-pink-400 transition">Diseños</a></li>
                <li><a href="#precios" className="hover:text-pink-400 transition">Precios</a></li>
                <li><Link href="/admin" className="hover:text-pink-400 transition">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 hola@babyinvites.com</li>
                <li>
                  <a href="https://wa.me/18293697838" className="hover:text-pink-400 transition" target="_blank">
                    📱 WhatsApp
                  </a>
                </li>
                <li>🕐 Lunes a Sábado, 9am - 8pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} BabyInvites. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}