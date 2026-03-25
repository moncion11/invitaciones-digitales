// src/components/GenericInvitationForm.tsx
'use client';
import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
  eventId: string;
  eventName: string;
  theme?: any;
  onGuestCreated: (guestId: string) => void;
}

export default function GenericInvitationForm({ 
  eventId, 
  eventName, 
  theme,
  onGuestCreated 
}: Props) {
  // Temas por diseño
  const themesByDesign: Record<string, any> = {
    'rosa-clasico': {
      primary: 'from-pink-500 to-pink-600',
      secondary: 'from-purple-500 to-purple-600',
      bgGradient: 'from-pink-50 via-purple-50 to-pink-50',
      accent: 'text-pink-600',
      headerIcon: '🎀',
    },
    'azul-bebe': {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-blue-50 via-cyan-50 to-blue-50',
      accent: 'text-blue-600',
      headerIcon: '⭐',
    },
    'dorado-lujo': {
      primary: 'from-yellow-500 to-yellow-600',
      secondary: 'from-amber-500 to-amber-600',
      bgGradient: 'from-yellow-50 via-amber-50 to-yellow-50',
      accent: 'text-yellow-600',
      headerIcon: '👑',
    },
    'verde-natural': {
      primary: 'from-green-500 to-green-600',
      secondary: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-green-50 via-emerald-50 to-green-50',
      accent: 'text-green-600',
      headerIcon: '🍃',
    },
    'morado-magico': {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-violet-500 to-violet-600',
      bgGradient: 'from-purple-50 via-violet-50 to-purple-50',
      accent: 'text-purple-600',
      headerIcon: '🌟',
    },
    'arcoiris': {
      primary: 'from-pink-500 via-purple-500 to-indigo-500',
      secondary: 'from-indigo-500 via-purple-500 to-pink-500',
      bgGradient: 'from-pink-50 via-purple-50 to-indigo-50',
      accent: 'text-purple-600',
      headerIcon: '🌈',
    },
  };

  const activeTheme = theme || themesByDesign['rosa-clasico'];

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const guestRef = await addDoc(collection(db, 'eventos', eventId, 'invitados'), {
        nombre: guestName.trim(),
        email: guestEmail.trim() || null,
        telefono: guestPhone.trim() || null,
        confirmado: false,
        regaloSeleccionado: null,
        fechaCreacion: Timestamp.now(),
        tipo: 'generico',
      });

      console.log('Invitado creado:', guestRef.id);
      
      const newUrl = `${window.location.origin}/?inv=${guestRef.id}`;
      window.history.replaceState({}, '', newUrl);
      
      onGuestCreated(guestRef.id);
      
    } catch (error: any) {
      console.error('Error creating guest:', error);
      setError('Error al crear invitado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${activeTheme.bgGradient} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">{activeTheme.headerIcon}</div>
          <h1 className={`text-3xl font-bold ${activeTheme.accent} mb-2`}>¡Baby Shower!</h1>
          <p className="text-gray-600">{eventName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Tu Nombre Completo *
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ej: María González"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="Ej: 829-123-4567"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Correo (opcional)
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${activeTheme.primary} hover:opacity-90 text-white font-bold py-4 px-6 rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
          >
            {loading ? '⏳ Creando invitación...' : '✨ Continuar'}
          </button>
        </form>

        {/* Info */}
        <div className={`mt-6 ${activeTheme.bgGradient} rounded-xl p-4 text-center`}>
          <p className="text-gray-700 text-sm">
            🎉 Ingresa tus datos para ver tu invitación personalizada
          </p>
        </div>
      </div>
    </div>
  );
}