// src/components/PortfolioPreviewModal.tsx
'use client';
import { useState, useEffect } from 'react';

interface Theme {
  primary: string;
  secondary: string;
  bgGradient: string;
  accent: string;
  lightBg: string;
  icon: string;
  headerIcon: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  design: string;
}

export default function PortfolioPreviewModal({ isOpen, onClose, design }: Props) {
  const [currentSection, setCurrentSection] = useState<'info' | 'rsvp' | 'confirmation' | 'gifts'>('info');

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDesignTheme = (): Theme => {
    const themes: Record<string, Theme> = {
      'rosa-clasico': {
        primary: 'from-pink-400 to-pink-600',
        secondary: 'from-purple-400 to-purple-600',
        bgGradient: 'from-pink-100 via-amber-50 to-pink-100',
        accent: 'text-pink-600',
        lightBg: 'bg-pink-50',
        icon: '🧸',
        headerIcon: '🎀',
      },
      'azul-bebe': {
        primary: 'from-blue-400 to-blue-600',
        secondary: 'from-cyan-400 to-cyan-600',
        bgGradient: 'from-blue-100 via-cyan-50 to-blue-100',
        accent: 'text-blue-600',
        lightBg: 'bg-blue-50',
        icon: '👶',
        headerIcon: '⭐',
      },
      'dorado-lujo': {
        primary: 'from-yellow-400 to-amber-500',
        secondary: 'from-orange-400 to-amber-600',
        bgGradient: 'from-yellow-100 via-amber-50 to-yellow-100',
        accent: 'text-amber-600',
        lightBg: 'bg-yellow-50',
        icon: '✨',
        headerIcon: '👑',
      },
      'verde-natural': {
        primary: 'from-green-400 to-emerald-600',
        secondary: 'from-teal-400 to-green-600',
        bgGradient: 'from-green-100 via-teal-50 to-green-100',
        accent: 'text-green-600',
        lightBg: 'bg-green-50',
        icon: '🌿',
        headerIcon: '🍃',
      },
      'morado-magico': {
        primary: 'from-purple-400 to-violet-600',
        secondary: 'from-fuchsia-400 to-purple-600',
        bgGradient: 'from-purple-100 via-fuchsia-50 to-purple-100',
        accent: 'text-purple-600',
        lightBg: 'bg-purple-50',
        icon: '🦄',
        headerIcon: '🌟',
      },
      'arcoiris': {
        primary: 'from-pink-400 via-purple-400 to-blue-400',
        secondary: 'from-yellow-400 via-orange-400 to-red-400',
        bgGradient: 'from-pink-100 via-purple-100 to-blue-100',
        accent: 'text-pink-600',
        lightBg: 'bg-pink-50',
        icon: '🌈',
        headerIcon: '🎨',
      },
    };
    return themes[design] || themes['rosa-clasico'];
  };

  const theme = getDesignTheme();

  // Datos de ejemplo
  const sampleData = {
    nombre: 'María & José',
    fecha: '15 de Diciembre 2024',
    hora: '3:00 PM',
    lugar: 'Salón de Eventos Los Ángeles',
    mensaje: 'Nos haría muy feliz contar con tu presencia para celebrar la llegada de nuestro bebé.',
  };

  const regalos = [
    { id: 1, nombre: 'Pañalera Premium', disponible: true, stock: 3 },
    { id: 2, nombre: 'Juego de Ropa', disponible: true, stock: 2 },
    { id: 3, nombre: 'Cuna Portátil', disponible: false, stock: 0 },
    { id: 4, nombre: 'Silla para Auto', disponible: true, stock: 1 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.primary} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{theme.headerIcon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">Vista Previa - {design.replace('-', ' ').toUpperCase()}</h2>
              <p className="text-white/90">Interactúa con la plantilla</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b px-6 py-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentSection('info')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === 'info'
                ? `bg-gradient-to-r ${theme.primary} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📋 Información
          </button>
          <button
            onClick={() => setCurrentSection('rsvp')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === 'rsvp'
                ? `bg-gradient-to-r ${theme.primary} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ✅ Confirmar
          </button>
          <button
            onClick={() => setCurrentSection('confirmation')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === 'confirmation'
                ? `bg-gradient-to-r ${theme.primary} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎉 Confirmado
          </button>
          <button
            onClick={() => setCurrentSection('gifts')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentSection === 'gifts'
                ? `bg-gradient-to-r ${theme.primary} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎁 Regalos
          </button>
        </div>

        {/* Preview Content */}
        <div className={`flex-1 overflow-y-auto bg-gradient-to-br ${theme.bgGradient} p-6`}>
          
          {/* Info Section */}
          {currentSection === 'info' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="text-6xl animate-bounce">{theme.icon}</div>
                <h1 className={`text-4xl font-bold ${theme.accent}`}>
                  {theme.headerIcon} ¡Baby Shower! {theme.headerIcon}
                </h1>
                <p className="text-xl text-gray-600">Estás invitado a celebrar la llegada de</p>
                <h2 className={`text-3xl font-bold ${theme.accent}`}>{sampleData.nombre}</h2>
                <p className="text-lg text-gray-500">y su pequeño tesoro</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${theme.lightBg} rounded-xl p-6 text-center`}>
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="font-bold text-gray-900 mb-2">Fecha</h3>
                  <p className="text-gray-700">{sampleData.fecha}</p>
                </div>
                <div className={`${theme.lightBg} rounded-xl p-6 text-center`}>
                  <div className="text-4xl mb-3">🕐</div>
                  <h3 className="font-bold text-gray-900 mb-2">Hora</h3>
                  <p className="text-gray-700">{sampleData.hora}</p>
                </div>
                <div className={`${theme.lightBg} rounded-xl p-6 text-center md:col-span-2`}>
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="font-bold text-gray-900 mb-2">Lugar</h3>
                  <p className="text-gray-700">{sampleData.lugar}</p>
                </div>
              </div>

              <div className={`${theme.lightBg} rounded-xl p-6`}>
                <p className="text-gray-700 text-center italic">{sampleData.mensaje}</p>
              </div>

              <button
                onClick={() => setCurrentSection('rsvp')}
                className={`w-full bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold py-4 rounded-full shadow-lg transition transform hover:scale-105`}
              >
                ✨ Confirmar Asistencia
              </button>
            </div>
          )}

          {/* RSVP Section */}
          {currentSection === 'rsvp' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${theme.accent} mb-4`}>Confirmación de Asistencia</h2>
                <p className="text-gray-600">¡Hola! Por favor confirma tu presencia</p>
              </div>

              <div className={`${theme.lightBg} rounded-xl p-6 space-y-4`}>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="829-123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                    readOnly
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentSection('confirmation')}
                className={`w-full bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold py-4 rounded-full shadow-lg transition transform hover:scale-105`}
              >
                ✅ Confirmar
              </button>
            </div>
          )}

          {/* Confirmation Section */}
          {currentSection === 'confirmation' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
              <div className="text-7xl animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-green-600">¡Confirmación Exitosa!</h2>
              <p className="text-gray-600">Gracias por confirmar tu asistencia.</p>
              
              <button
                onClick={() => setCurrentSection('gifts')}
                className={`w-full bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold py-4 rounded-full shadow-lg transition transform hover:scale-105`}
              >
                🎁 Ver Lista de Regalos
              </button>
            </div>
          )}

          {/* Gifts Section */}
          {currentSection === 'gifts' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${theme.accent} mb-4`}>Lista de Regalos</h2>
                <p className="text-gray-600">Selecciona un regalo (solo demostración)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {regalos.map((regalo) => (
                  <div
                    key={regalo.id}
                    className={`border-2 rounded-xl p-4 ${
                      regalo.disponible
                        ? 'border-green-300 bg-green-50 hover:shadow-md cursor-pointer'
                        : 'border-gray-300 bg-gray-100 opacity-50'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900">{regalo.nombre}</h4>
                    <p className={`text-sm mt-2 ${regalo.disponible ? 'text-green-600' : 'text-red-600'}`}>
                      {regalo.disponible ? `✅ Disponible (${regalo.stock})` : '❌ Agotado'}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentSection('info')}
                className={`w-full bg-gradient-to-r ${theme.secondary} hover:opacity-90 text-white font-bold py-3 rounded-full shadow-lg transition`}
              >
                🔄 Volver al Inicio
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 border-t px-6 py-4 text-center text-sm text-gray-600">
          <p>💡 Esta es una vista previa interactiva. Los cambios no se guardan.</p>
        </div>
      </div>
    </div>
  );
}