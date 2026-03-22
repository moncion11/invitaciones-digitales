// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está logueado
    const logged = localStorage.getItem('adminLogged');
    if (logged === 'true') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin contraseña - acceso directo
    localStorage.setItem('adminLogged', 'true');
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLogged');
    setIsAdmin(false);
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="text-center">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-pink-600 font-semibold text-lg">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full border-2 border-pink-200">
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4">🎉</h1>
            <h2 className="text-3xl font-bold text-gray-900">Baby Shower</h2>
            <p className="text-gray-700 font-semibold mt-2">Panel de Administración</p>
            <p className="text-gray-600 text-sm mt-4">
              Gestiona invitados, regalos y configuración del evento
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
              <p className="text-gray-800 font-medium text-center">
                👋 ¡Hola! Bienvenido al panel de control
              </p>
              <p className="text-gray-600 text-sm text-center mt-2">
                Haz clic en el botón para acceder
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition shadow-lg transform hover:scale-105 text-lg"
            >
              🚀 Ingresar al Panel
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              🔒 Acceso exclusivo para organizadores
            </p>
          </div>

          {/* Link para volver a la invitación */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-pink-600 hover:text-pink-800 underline font-medium text-sm"
            >
              ← Volver a la invitación
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}