// src/components/InvitationView.tsx
import React from 'react';

interface Props {
  guestName: string;
  onConfirm: () => void;
  loading: boolean;
}

export default function InvitationView({ guestName, onConfirm, loading }: Props) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <p className="text-pink-500 font-medium uppercase tracking-wider text-sm">Estás invitado</p>
        <h2 className="text-2xl font-bold text-gray-900">¡Hola, {guestName}!</h2>
        <p className="text-gray-600">
          Nos haría muy feliz contar con tu presencia para celebrar la llegada de nuestro bebé.
        </p>
      </div>

      <div className="bg-blue-50 text-blue-500 border-blue-100">
        <p className="font-semibold">📅 15 de Diciembre, 2024</p>
        <p className="text-gray-500">🕒 18:00 hrs</p>
        <p className="text-gray-500">📍 Salón "Celestial", Av. Principal #123</p>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transition disabled:opacity-50"
      >
        {loading ? 'Confirmando...' : '✅ Confirmar Asistencia'}
      </button>
    </div>
  );
}