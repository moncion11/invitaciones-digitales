// src/app/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, doc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Gift {
  id: string;
  nombre: string;
  precio?: string;
  imagen?: string;
  stock: number;
  disponible: boolean;
  ilimitado?: boolean;
  seleccionado?: boolean;
}

interface GuestData {
  id: string;
  guestId: string;
  nombre: string;
  confirmado: boolean;
  regaloSeleccionado: string | null;
  fechaConfirmacion?: any;
}

interface Theme {
  primary: string;
  secondary: string;
  bgGradient: string;
  accent: string;
  buttonHover: string;
  lightBg: string;
  borderColor: string;
  icon: string;
  headerIcon: string;
}

function InvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('inv');
  
  const [currentSection, setCurrentSection] = useState<'info' | 'rsvp' | 'confirmation' | 'gifts' | 'thankyou'>('info');
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [eventoData, setEventData] = useState<any>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const getDesignTheme = (): Theme => {
    const design = eventoData?.diseño || 'rosa-clasico';
    
    const themes: Record<string, Theme> = {
      'rosa-clasico': {
        primary: 'from-pink-400 to-pink-600',
        secondary: 'from-purple-400 to-purple-600',
        bgGradient: 'from-pink-100 via-amber-50 to-pink-100',
        accent: 'text-pink-600',
        buttonHover: 'from-pink-600 to-purple-600',
        lightBg: 'bg-pink-50',
        borderColor: 'border-pink-300',
        icon: '🧸',
        headerIcon: '🎀',
      },
      'azul-bebe': {
        primary: 'from-blue-400 to-blue-600',
        secondary: 'from-cyan-400 to-cyan-600',
        bgGradient: 'from-blue-100 via-cyan-50 to-blue-100',
        accent: 'text-blue-600',
        buttonHover: 'from-blue-600 to-cyan-600',
        lightBg: 'bg-blue-50',
        borderColor: 'border-blue-300',
        icon: '👶',
        headerIcon: '⭐',
      },
      'dorado-lujo': {
        primary: 'from-yellow-400 to-amber-500',
        secondary: 'from-orange-400 to-amber-600',
        bgGradient: 'from-yellow-100 via-amber-50 to-yellow-100',
        accent: 'text-amber-600',
        buttonHover: 'from-amber-500 to-orange-600',
        lightBg: 'bg-yellow-50',
        borderColor: 'border-amber-300',
        icon: '✨',
        headerIcon: '👑',
      },
      'verde-natural': {
        primary: 'from-green-400 to-emerald-600',
        secondary: 'from-teal-400 to-green-600',
        bgGradient: 'from-green-100 via-teal-50 to-green-100',
        accent: 'text-green-600',
        buttonHover: 'from-emerald-600 to-teal-600',
        lightBg: 'bg-green-50',
        borderColor: 'border-green-300',
        icon: '🌿',
        headerIcon: '🍃',
      },
      'morado-magico': {
        primary: 'from-purple-400 to-violet-600',
        secondary: 'from-fuchsia-400 to-purple-600',
        bgGradient: 'from-purple-100 via-fuchsia-50 to-purple-100',
        accent: 'text-purple-600',
        buttonHover: 'from-violet-600 to-fuchsia-600',
        lightBg: 'bg-purple-50',
        borderColor: 'border-purple-300',
        icon: '🦄',
        headerIcon: '🌟',
      },
      'arcoiris': {
        primary: 'from-pink-400 via-purple-400 to-blue-400',
        secondary: 'from-yellow-400 via-orange-400 to-red-400',
        bgGradient: 'from-pink-100 via-purple-100 to-blue-100',
        accent: 'text-pink-600',
        buttonHover: 'from-purple-600 to-blue-600',
        lightBg: 'bg-pink-50',
        borderColor: 'border-pink-300',
        icon: '🌈',
        headerIcon: '🎨',
      },
    };
    
    return themes[design] || themes['rosa-clasico'];
  };

  const theme = getDesignTheme();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchGuestData();
  }, [token]);

  const fetchGuestData = async () => {
    try {
      const eventosRef = collection(db, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      
      let foundGuest: any = null;
      let foundEvento: any = null;
      let guestId = '';

      for (const eventoDoc of eventosSnapshot.docs) {
        const invitadosRef = collection(db, 'eventos', eventoDoc.id, 'invitados');
        const q = query(invitadosRef, where('__name__', '==', token));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          foundGuest = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          foundEvento = { id: eventoDoc.id, ...eventoDoc.data() };
          guestId = snapshot.docs[0].id;
          break;
        }
      }

      if (foundGuest && foundEvento) {
        setGuestData({ 
          ...foundGuest, 
          guestId,
          confirmado: foundGuest.confirmado || false,
          regaloSeleccionado: foundGuest.regaloSeleccionado || null,
        });
        setEventData(foundEvento);
        
        const giftsRef = collection(db, 'eventos', foundEvento.id, 'regalos');
        const giftsSnapshot = await getDocs(giftsRef);
        const giftsList = giftsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          ilimitado: doc.data().stock > 100,
          seleccionado: false,
          disponible: doc.data().disponible ?? true,
        })) as Gift[];
        setGifts(giftsList);
        
        if (foundGuest.confirmado) {
          setCurrentSection('gifts');
        }
        if (foundGuest.regaloSeleccionado) {
          setSelectedGiftId(foundGuest.regaloSeleccionado);
          setCurrentSection('thankyou');
        }
      }
    } catch (error) {
      console.error('Error fetching guest:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAttendance = async () => {
    if (!token || !guestData) return;
    
    setConfirming(true);
    try {
      const guestRef = doc(db, 'eventos', eventoData.id, 'invitados', guestData.guestId);
      await updateDoc(guestRef, {
        confirmado: true,
        fechaConfirmacion: Timestamp.now(),
      });
      
      setGuestData({ ...guestData, confirmado: true });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setCurrentSection('confirmation');
    } catch (error) {
      console.error('Error confirming attendance:', error);
      alert('❌ Error al confirmar asistencia');
    } finally {
      setConfirming(false);
    }
  };

  const selectGift = async (giftId: string) => {
    if (!token || !guestData) return;
    
    const gift = gifts.find(g => g.id === giftId);
    if (!gift || (!gift.disponible && !gift.ilimitado)) {
      alert('Este regalo ya fue seleccionado por otro invitado');
      return;
    }
    
    setConfirming(true);
    try {
      const guestRef = doc(db, 'eventos', eventoData.id, 'invitados', guestData.guestId);
      const giftRef = doc(db, 'eventos', eventoData.id, 'regalos', giftId);
      
      await runTransaction(db, async (transaction) => {
        const giftSnap = await transaction.get(giftRef);
        const guestSnap = await transaction.get(guestRef);
        
        if (!giftSnap.exists() || !guestSnap.exists()) {
          throw new Error('Documento no encontrado');
        }
        
        const giftData = giftSnap.data();
        const currentGuestData = guestSnap.data();
        
        if (currentGuestData.regaloSeleccionado) {
          throw new Error('Ya has seleccionado un regalo');
        }
        
        const currentStock = giftData.stock || 0;
        if (currentStock <= 0 && !giftData.ilimitado) {
          throw new Error('Regalo agotado');
        }
        
        const newStock = giftData.ilimitado ? currentStock : currentStock - 1;
        
        transaction.update(giftRef, {
          stock: newStock,
          disponible: newStock > 0 || giftData.ilimitado
        });
        
        transaction.update(guestRef, {
          regaloSeleccionado: giftId
        });
      });
      
      setSelectedGiftId(giftId);
      setGifts(prev => prev.map(g => 
        g.id === giftId 
          ? { ...g, seleccionado: true, disponible: g.ilimitado ?? false } 
          : g
      ) as Gift[]);
      setGuestData({ ...guestData, regaloSeleccionado: giftId });
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => setCurrentSection('thankyou'), 3000);
    } catch (error: any) {
      console.error('Error selecting gift:', error);
      alert(error.message || 'Error al seleccionar regalo');
    } finally {
      setConfirming(false);
    }
  };

  const shareToWhatsApp = () => {
    const message = `¡Hola! Te invito a mi Baby Shower 🎉\n\nFecha: ${eventoData?.configuracion?.fecha || 'Por definir'}\nHora: ${eventoData?.configuracion?.hora || 'Por definir'}\nLugar: ${eventoData?.configuracion?.lugar || 'Por definir'}\n\nConfirma tu asistencia aquí: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  useEffect(() => {
    if (showConfetti) {
      const colors = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#fb923c'];
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
      }
    }
  }, [showConfetti]);

  const selectedCount = gifts.filter(g => g.seleccionado && !g.ilimitado).length;
  const totalCount = gifts.filter(g => !g.ilimitado).length;
  const progressPercentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.bgGradient}`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{theme.headerIcon}</div>
          <p className="text-gray-700 text-lg font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (!token || !guestData || !eventoData) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.bgGradient}`}>
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido o expirado</h2>
          <p className="text-gray-600 mb-6">El link que estás usando no es válido o la invitación ya no existe.</p>
          <a href="/" className={`bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition`}>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/quicksand@4.5.0/index.css');
        
        * {
          font-family: 'Quicksand', sans-serif;
        }
        
        .card-shadow {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .gift-card {
          transition: all 0.3s ease;
        }
        
        .gift-card:hover {
          transform: translateY(-5px);
        }
        
        .gift-card.selected {
          border: 3px solid #f472b6;
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        }
        
        .gift-card.unavailable {
          opacity: 0.5;
          pointer-events: none;
          background: #f3f4f6;
        }
        
        .gift-card.unlimited {
          border: 2px dashed #60a5fa;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          transform: scale(1.05);
        }
        
        .section-hidden {
          display: none;
        }
        
        .section-visible {
          display: block;
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #f472b6;
          animation: confetti-fall 3s linear infinite;
          z-index: 1000;
          pointer-events: none;
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .progress-bar {
          transition: width 0.5s ease;
        }
        
        .checkmark {
          animation: checkmark-appear 0.5s ease;
        }
        
        @keyframes checkmark-appear {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient}`}>
        
        {/* Header */}
        <header className="relative overflow-hidden">
          <div className={`w-full h-64 bg-gradient-to-r ${theme.primary} flex items-center justify-center relative`}>
            <div className="absolute top-4 left-4 text-4xl animate-bounce">{theme.icon}</div>
            <div className="absolute top-4 right-4 text-4xl animate-bounce delay-500">{theme.icon}</div>
            <div className="absolute bottom-2 left-10 text-2xl">{theme.headerIcon}</div>
            <div className="absolute bottom-2 right-12 text-2xl">{theme.headerIcon}</div>
            
            <div className="text-center relative z-10">
              <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2 animate-float">
                {theme.headerIcon} Baby Shower {theme.headerIcon}
              </h1>
              <p className="text-white/95 text-xl font-semibold drop-shadow">{eventoData.nombre}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* Section 1: Event Information */}
          {currentSection === 'info' && (
            <section className="section-visible bg-white rounded-3xl card-shadow p-8 mb-8">
              <div className="text-center mb-8">
                <h1 className={`text-4xl font-bold ${theme.accent} mb-4 animate-float`}>{theme.headerIcon} ¡Baby Shower!</h1>
                <p className="text-xl text-gray-600">Estás invitado a celebrar la llegada de</p>
                <h2 className={`text-3xl font-bold ${theme.accent} mt-2`}>{eventoData.nombre}</h2>
                <p className="text-lg text-gray-500 mt-2">y su pequeño tesoro</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`${theme.lightBg} rounded-2xl p-6 text-center`}>
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="font-bold text-gray-700 mb-2">Fecha</h3>
                  <p className="text-gray-600">{eventoData.configuracion?.fecha || 'Por definir'}</p>
                  <p className="text-gray-600">{eventoData.configuracion?.hora || 'Por definir'}</p>
                </div>
                
                <div className={`${theme.lightBg} rounded-2xl p-6 text-center`}>
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="font-bold text-gray-700 mb-2">Lugar</h3>
                  <p className="text-gray-600">{eventoData.configuracion?.lugar || 'Por definir'}</p>
                </div>
              </div>
              
              <div className={`${theme.lightBg} rounded-2xl p-6 mb-8`}>
                <h3 className="font-bold text-gray-700 mb-4 text-center">🎉 Actividades</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎮</div>
                    <p className="text-sm text-gray-600">Juegos y Dinámicas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🍰</div>
                    <p className="text-sm text-gray-600">Deliciosa Comida</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <p className="text-sm text-gray-600">Sorpresas Especiales</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => setCurrentSection('rsvp')}
                  className={`btn-primary bg-gradient-to-r ${theme.primary} hover:bg-gradient-to-r hover:${theme.buttonHover} text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg`}
                >
                  ✨ Confirmar Asistencia ✨
                </button>
              </div>
            </section>
          )}

          {/* Section 2: RSVP */}
          {currentSection === 'rsvp' && (
            <section className="section-visible bg-white rounded-3xl card-shadow p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${theme.accent} mb-4`}>Confirmación de Asistencia</h2>
                <p className="text-gray-600">¡Hola, {guestData.nombre}! Por favor confirma tu presencia</p>
              </div>
              
              <div className={`${theme.lightBg} rounded-2xl p-6 mb-8 text-center`}>
                <p className="text-gray-700 mb-4">{eventoData.configuracion?.mensaje || 'Nos haría muy feliz contar con tu presencia para celebrar la llegada de nuestro bebé.'}</p>
                <div className="flex justify-center gap-4">
                  <span className="text-3xl">{theme.icon}</span>
                  <span className="text-3xl">{theme.headerIcon}</span>
                  <span className="text-3xl">{theme.icon}</span>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={confirmAttendance}
                  disabled={confirming}
                  className={`btn-primary bg-gradient-to-r ${theme.primary} hover:bg-gradient-to-r hover:${theme.buttonHover} text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {confirming ? '⏳ Confirmando...' : '✅ Confirmar Asistencia'}
                </button>
              </div>
            </section>
          )}

          {/* Section 3: Confirmation */}
          {currentSection === 'confirmation' && (
            <section className="section-visible bg-white rounded-3xl card-shadow p-8 mb-8 text-center">
              <div className="animate-float mb-6">
                <svg className="w-24 h-24 mx-auto text-green-500 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">¡Confirmación Exitosa!</h2>
              <p className="text-gray-600 mb-6">Gracias por confirmar tu asistencia. Estamos muy emocionados de celebrarte.</p>
              <div className={`${theme.lightBg} rounded-2xl p-6 mb-6`}>
                <p className={`${theme.accent} font-bold`}>🎁 Ahora puedes seleccionar tu regalo</p>
              </div>
              <button 
                onClick={() => setCurrentSection('gifts')}
                className={`btn-primary bg-gradient-to-r ${theme.primary} hover:bg-gradient-to-r hover:${theme.buttonHover} text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg`}
              >
                🎁 Ver Lista de Regalos
              </button>
            </section>
          )}

          {/* Section 4: Gift Wishlist */}
          {currentSection === 'gifts' && (
            <section className="section-visible bg-white rounded-3xl card-shadow p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${theme.accent} mb-4`}>Lista de Deseos</h2>
                <p className="text-gray-600 mb-4">Selecciona un regalo para ayudar a los papás</p>
                <div className="bg-blue-50 rounded-xl p-4 inline-block">
                  <p className="text-sm text-blue-600">
                    <span className="font-bold">💡 Tip:</span> Los artículos con borde punteado azul son ilimitados
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Regalos seleccionados</span>
                  <span className={`${theme.accent} font-bold`}>{selectedCount}/{totalCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`progress-bar bg-gradient-to-r ${theme.primary} h-4 rounded-full`} 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Gift Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gifts.map((gift) => (
                  <div 
                    key={gift.id}
                    className={`gift-card rounded-2xl p-6 cursor-pointer ${
                      (!gift.disponible && !gift.ilimitado) ? 'unavailable' : ''
                    } ${gift.ilimitado ? 'unlimited' : ''} ${
                      gift.seleccionado ? 'selected' : 'bg-white border-2 border-gray-200'
                    }`}
                    onClick={() => (gift.disponible || gift.ilimitado) && selectGift(gift.id)}
                  >
                    <div className="text-5xl mb-4 text-center">{gift.imagen || '🎁'}</div>
                    <h3 className="font-bold text-gray-700 mb-2">{gift.nombre}</h3>
                    <p className={`${theme.accent} font-bold mb-3`}>{gift.precio || 'Consultar'}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${gift.ilimitado ? 'text-blue-600' : 'text-gray-500'}`}>
                        {gift.ilimitado ? '♾️ Ilimitado' : (gift.disponible ? '✅ Disponible' : '❌ No disponible')}
                      </span>
                      {gift.seleccionado && <span className="text-green-600 font-bold">✓ Seleccionado</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selection Confirmation */}
              {selectedGiftId && (
                <div className="mt-8 bg-green-50 rounded-2xl p-6 text-center">
                  <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">¡Regalo Seleccionado!</h3>
                  <p className="text-gray-600 mb-4">{gifts.find(g => g.id === selectedGiftId)?.nombre}</p>
                  <p className="text-sm text-gray-500">Gracias por tu generosidad. Los padres estarán muy felices.</p>
                </div>
              )}
            </section>
          )}

          {/* Section 5: Final Thank You */}
          {currentSection === 'thankyou' && (
            <section className="section-visible bg-white rounded-3xl card-shadow p-8 mb-8 text-center">
              <div className="text-7xl mb-6 animate-float">{theme.icon}{theme.headerIcon}{theme.icon}</div>
              <h2 className={`text-3xl font-bold ${theme.accent} mb-4`}>¡Gracias por ser parte de este momento especial!</h2>
              <p className="text-gray-600 mb-6">Tu presencia y regalo hacen que este día sea aún más memorable.</p>
              <div className={`${theme.lightBg} rounded-2xl p-6`}>
                <p className={`${theme.accent} font-bold`}>📱 ¿Tienes preguntas?</p>
                <p className="text-gray-600">Contáctanos por WhatsApp</p>
              </div>
            </section>
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500">Hecho con 💕 para {eventoData.nombre}</p>
            <p className="text-gray-400 text-sm mt-2">Baby Shower {new Date().getFullYear()}</p>
          </div>
        </footer>

        {/* Floating Share Button */}
        <button 
          onClick={shareToWhatsApp}
          className={`fixed bottom-6 right-6 bg-gradient-to-r ${theme.primary} hover:bg-gradient-to-r hover:${theme.buttonHover} text-white font-bold py-4 px-6 rounded-full shadow-lg z-50 flex items-center gap-2 transition transform hover:scale-105`}
        >
          📤 Compartir
        </button>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-50 to-pink-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎀</div>
          <p className="text-gray-700 text-lg font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>Cargando invitación...</p>
        </div>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}