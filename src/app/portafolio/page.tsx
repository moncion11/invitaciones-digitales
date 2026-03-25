// src/app/portafolio/page.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';

const WHATSAPP_NUMBER = '18293697838';

const galleryItems = [
  {
    id: 'osito-nubes',
    nombre: 'Osito en las Nubes',
    descripcion: 'Perfecto para Baby Shower o Revelación de Género.',
    precio: 'RD$ 1,500',
    precioColor: 'text-pink-600',
    categoria: 'baby',
    imagen: 'https://image.qwenlm.ai/public_source/7d181c9a-3b2b-4e8d-b4e7-26abe56c8ca5/1585f5128-8728-4f6f-aac0-db25cd02fef6.png',
  },
  {
    id: 'fiesta-colorida',
    nombre: 'Fiesta Colorida',
    descripcion: 'Alegre y vibrante para celebrar la vida.',
    precio: 'RD$ 1,500',
    precioColor: 'text-blue-600',
    categoria: 'cumpleanos',
    imagen: 'https://image.qwenlm.ai/public_source/7d181c9a-3b2b-4e8d-b4e7-26abe56c8ca5/18e790636-3beb-4f6c-a11f-f154b86c45d6.png',
  },
  {
    id: 'elegancia-floral',
    nombre: 'Elegancia Floral',
    descripcion: 'Sofisticación y romance en cada detalle.',
    precio: 'RD$ 3,500',
    precioColor: 'text-purple-600',
    categoria: 'boda',
    imagen: 'https://image.qwenlm.ai/public_source/7d181c9a-3b2b-4e8d-b4e7-26abe56c8ca5/1cfe3b202-ad13-4acc-91c7-cb952524731c.png',
  },
  {
    id: 'princesa-real',
    nombre: 'Princesa Real',
    descripcion: 'Un diseño de cuento de hadas para sus 15 años.',
    precio: 'RD$ 2,500',
    precioColor: 'text-indigo-600',
    categoria: '15anos',
    imagen: 'https://image.qwenlm.ai/public_source/7d181c9a-3b2b-4e8d-b4e7-26abe56c8ca5/1feab7d3b-439f-448c-a4af-2d3daac7307c.png',
  },
  {
    id: 'dulce-espera',
    nombre: 'Dulce Espera',
    descripcion: 'Tonos pastel suaves y tiernos detalles.',
    precio: 'RD$ 1,500',
    precioColor: 'text-pink-600',
    categoria: 'baby',
    emoji: '🧸',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'super-heroes',
    nombre: 'Super Héroes',
    descripcion: 'Dinámico y divertido para los pequeños héroes.',
    precio: 'RD$ 1,500',
    precioColor: 'text-blue-600',
    categoria: 'cumpleanos',
    emoji: '🦸‍♂️',
    bgColor: 'bg-blue-50',
  },
];

const filterButtons = [
  { id: 'all', label: 'Todos' },
  { id: 'baby', label: '👶 Baby' },
  { id: 'cumpleanos', label: '🎂 Cumpleaños' },
  { id: 'boda', label: '💒 Bodas' },
  { id: '15anos', label: '👑 15 Años' },
];

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const WhatsAppIconSmall = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export default function PortafolioPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    diseño: '',
    mensaje: '',
  });

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.categoria === activeFilter);

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

  return (
    <>
      <div className="bg-gray-50 text-gray-800 antialiased overflow-x-hidden">

        {/* Hero Section */}
        <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://image.qwenlm.ai/public_source/7d181c9a-3b2b-4e8d-b4e7-26abe56c8ca5/126adc86e-17b0-41e9-952c-c11c3510dfcc.png"
              alt="Fondo Festivo"
              fill
              className="object-cover opacity-60"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-gray-50" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center pt-20">
            <div className="inline-block mb-6 animate-float">
              <span className="text-7xl">🎉</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight">
              Invita<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Digital</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
              Invitaciones digitales interactivas para celebrar cada momento especial de tu vida.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-semibold shadow-sm text-gray-600">👶 Baby Shower</span>
              <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-semibold shadow-sm text-gray-600">🎂 Cumpleaños</span>
              <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-semibold shadow-sm text-gray-600">💒 Bodas</span>
              <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-semibold shadow-sm text-gray-600">🎓 Graduación</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#catalogo"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform duration-300"
              >
                Ver Diseños
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-green-500 hover:text-green-600 transition duration-300 flex items-center justify-center gap-2"
              >
                <WhatsAppIcon />
                Contactar
              </a>
            </div>
          </div>
        </header>

        {/* Pricing Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Precios Accesibles</h2>
              <p className="text-gray-600 text-lg">Calidad premium a precios que caben en tu presupuesto</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Baby */}
              <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-3xl border border-pink-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4">👶</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Baby</h3>
                <p className="text-gray-500 text-sm mb-4">Shower, Reveal, Bautizo</p>
                <div className="text-3xl font-bold text-pink-600 mb-6">RD$ 1,500</div>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Diseño Digital</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Confirmación RSVP</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lista de Regalos</li>
                </ul>
                <a href="#catalogo" className="block w-full py-3 rounded-xl bg-pink-100 text-pink-700 font-bold hover:bg-pink-600 hover:text-white transition duration-300 text-center">Elegir Diseño</a>
              </div>

              {/* Cumpleaños */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl border border-blue-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4">🎂</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cumpleaños</h3>
                <p className="text-gray-500 text-sm mb-4">Niños, Adultos, 15 Años</p>
                <div className="text-3xl font-bold text-blue-600 mb-6">RD$ 1,500+</div>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Diseño Digital</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Confirmación RSVP</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lista de Regalos</li>
                </ul>
                <a href="#catalogo" className="block w-full py-3 rounded-xl bg-blue-100 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition duration-300 text-center">Elegir Diseño</a>
              </div>

              {/* Bodas */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-3xl border border-purple-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Popular</div>
                <div className="text-5xl mb-4">💒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bodas</h3>
                <p className="text-gray-500 text-sm mb-4">Boda, Bridal Shower</p>
                <div className="text-3xl font-bold text-purple-600 mb-6">RD$ 3,500+</div>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Diseño Premium</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Confirmación RSVP</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lista de Regalos</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Mapa de Ubicación</li>
                </ul>
                <a href="#catalogo" className="block w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition duration-300 text-center">Elegir Diseño</a>
              </div>

              {/* Graduación */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Graduación</h3>
                <p className="text-gray-500 text-sm mb-4">Universidad, Escuela</p>
                <div className="text-3xl font-bold text-indigo-600 mb-6">RD$ 1,500+</div>
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Diseño Digital</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Confirmación RSVP</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lista de Regalos</li>
                </ul>
                <a href="#catalogo" className="block w-full py-3 rounded-xl bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-600 hover:text-white transition duration-300 text-center">Elegir Diseño</a>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Diseños</h2>
              <p className="text-gray-600 mb-8">Explora nuestra colección de plantillas listas para usar</p>

              {/* Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {filterButtons.map(btn => (
                  <button
                    key={btn.id}
                    onClick={() => setActiveFilter(btn.id)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                      activeFilter === btn.id
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className={`relative h-64 overflow-hidden ${!item.imagen ? `${item.bgColor} flex items-center justify-center` : ''}`}>
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <span className="text-6xl">{item.emoji}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="px-4 py-2 bg-white text-gray-900 rounded-full font-bold text-sm">Ver Demo</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{item.nombre}</h3>
                      <span className={`${item.precioColor} font-bold`}>{item.precio}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{item.descripcion}</p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola! Me interesa el diseño ${item.nombre}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-500 hover:text-white transition duration-300 font-medium"
                    >
                      Contratar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Design Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

              <div className="relative z-10">
                <div className="text-6xl mb-6">🎨</div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Quieres algo 100% Único?</h2>
                <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                  Creamos invitaciones personalizadas desde cero basadas en tu idea, imagen o referencia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <WhatsAppIconSmall />
                    Cotizar por WhatsApp
                  </a>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105 border border-white/30"
                  >
                    📋 Llenar Formulario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🎉</span> InvitaDigital
                </h3>
                <p className="text-gray-400 mb-6">
                  Creamos experiencias digitales inolvidables para tus eventos más especiales.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-gray-200">Enlaces Rápidos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition">Inicio</a></li>
                  <li><a href="#catalogo" className="hover:text-white transition">Catálogo</a></li>
                  <li><a href="#" className="hover:text-white transition">Preguntas Frecuentes</a></li>
                  <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-gray-200">Contacto</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <span>📱</span> +1 (829) 369-7838
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📧</span> hola@invitadigital.com
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📍</span> República Dominicana
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} InvitaDigital. Todos los derechos reservados.</p>
              <p className="mt-2">Hecho con 💕 para celebrar momentos especiales.</p>
            </div>
          </div>
        </footer>
      </div>

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
                <label className="block text-gray-900 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {galleryItems.map(d => (
                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Mensaje</label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-600 transition"
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
