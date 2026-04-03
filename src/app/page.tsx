// src/app/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, doc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlantillaById } from '@/lib/templates';
import { format12Hour, formatDateSpanish } from '@/lib/utils';
import GenericInvitationForm from '@/components/GenericInvitationForm';
import InvitationRenderer from '@/components/admin/InvitationRenderer';
import { useModal } from '@/components/Modal';

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

function InvitationContent() {
  const searchParams = useSearchParams();
  const { showAlert } = useModal();
  const guestToken = searchParams.get('inv');
  const eventoToken = searchParams.get('evento');
  
  const [currentSection, setCurrentSection] = useState<'form' | 'info' | 'rsvp' | 'confirmation' | 'gifts' | 'thankyou'>('info');
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [eventoData, setEventData] = useState<any>(null);
  const [plantilla, setPlantilla] = useState<any>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!guestToken && !eventoToken) {
      setLoading(false);
      return;
    }
    fetchGuestData();
  }, [guestToken, eventoToken]);

  const fetchGuestData = async () => {
    try {
      const eventosRef = collection(db, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      
      let foundGuest: any = null;
      let foundEvento: any = null;
      let guestId = '';

      if (guestToken) {
        for (const eventoDoc of eventosSnapshot.docs) {
          const invitadosRef = collection(db, 'eventos', eventoDoc.id, 'invitados');
          const q = query(invitadosRef, where('__name__', '==', guestToken));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            foundGuest = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            foundEvento = { id: eventoDoc.id, ...eventoDoc.data() };
            guestId = snapshot.docs[0].id;
            break;
          }
        }
      }
      else if (eventoToken) {
        for (const eventoDoc of eventosSnapshot.docs) {
          if (eventoDoc.data().token === eventoToken) {
            foundEvento = { id: eventoDoc.id, ...eventoDoc.data() };
            setCurrentSection('form');
            break;
          }
        }
      }

      if (foundEvento) {
        setEventData(foundEvento);
        
        if (foundEvento.plantillaId) {
          const plantillaData = await getPlantillaById(foundEvento.plantillaId);
          setPlantilla(plantillaData);
        }
        
        if (foundGuest) {
          setGuestData({ 
            ...foundGuest, 
            guestId,
            confirmado: foundGuest.confirmado || false,
            regaloSeleccionado: foundGuest.regaloSeleccionado || null,
          });
          
          const giftsRef = collection(db, 'eventos', foundEvento.id, 'regalos');
          const giftsSnapshot = await getDocs(giftsRef);
          const giftsList = giftsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            ilimitado: doc.data().stock > 100,
            seleccionado: false,
            disponible: doc.data().disponible ?? true,
          })) as Gift[];
          giftsList.sort((a, b) => ((a as any).orden ?? 999) - ((b as any).orden ?? 999) || (a as any).nombre?.localeCompare((b as any).nombre));
          setGifts(giftsList);
          
          if (foundGuest.confirmado) {
            setCurrentSection('gifts');
          }
          if (foundGuest.regaloSeleccionado) {
            setSelectedGiftId(foundGuest.regaloSeleccionado);
            setCurrentSection('thankyou');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching guest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCreated = (newGuestId: string) => {
    const newUrl = `${window.location.origin}/?inv=${newGuestId}`;
    window.history.replaceState({}, '', newUrl);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const confirmAttendance = async () => {
    if (!guestToken || !guestData) return;
    
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
      showAlert('Error al confirmar asistencia', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const selectGift = async (giftId: string) => {
    if (!guestToken || !guestData) return;
    
    const gift = gifts.find(g => g.id === giftId);
    if (!gift || (!gift.disponible && !gift.ilimitado)) {
      showAlert('Este regalo ya fue seleccionado por otro invitado', 'warning');
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
      showAlert(error.message || 'Error al seleccionar regalo', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const shareToWhatsApp = () => {
    const message = `¡Hola! Te invito a ${eventoData?.tituloPrincipal || 'mi evento'} 🎉\n\n${eventoData?.subtitulo || ''} ${eventoData.configuracion?.personalizada?.nombreBebe || ''}\n\nFecha: ${eventoData?.configuracion?.fecha || 'Por definir'}\nHora: ${eventoData?.configuracion?.hora ? format12Hour(eventoData.configuracion.hora) : 'Por definir'}\nLugar: ${eventoData?.configuracion?.lugar || 'Por definir'}\n\nConfirma tu asistencia aquí: ${window.location.href}`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <p className="text-gray-700 text-lg font-medium">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (!guestToken && !eventoToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md">
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido o expirado</h2>
          <p className="text-gray-600 mb-6">El link que estás usando no es válido o la invitación ya no existe.</p>
          <a href="/portafolio" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition">
            Ver Portafolio
          </a>
        </div>
      </div>
    );
  }

  // Función para renderizar diseño según el tipo seleccionado
  const renderDesign = () => {
    const design = eventoData.diseño || 'rosa-clasico';
    
    // DISEÑO 1: Baby Shower Clásico Elegante (rosa-clasico, morado-magico)
    if (design === 'rosa-clasico' || design === 'morado-magico') {
      return (
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200">
          {/* Header Decorativo */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center relative overflow-hidden">
            <div className="absolute top-2 left-4 text-4xl opacity-50">🎈</div>
            <div className="absolute top-2 right-4 text-4xl opacity-50">⭐</div>
            <div className="absolute bottom-2 left-8 text-4xl opacity-50">🧸</div>
            <div className="absolute bottom-2 right-8 text-4xl opacity-50">🎀</div>
            
            <div className="text-6xl mb-4 relative z-10">🎀</div>
            <h1 className="text-4xl font-bold text-white mb-2 relative z-10">
              {eventoData.tituloPrincipal || '¡Baby Shower!'}
            </h1>
            <p className="text-purple-100 text-lg relative z-10">{eventoData.subtitulo}</p>
          </div>
          
          {/* Contenido */}
          <div className="p-8 text-center">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              {eventoData.configuracion?.personalizada?.nombreBebe || 'Nombre del Bebé'}
            </h2>
            
            {eventoData.configuracion?.personalizada?.padres && (
              <p className="text-gray-700 text-lg mb-4 font-medium">
                👨‍👩‍👧 {eventoData.configuracion.personalizada.padres}
              </p>
            )}
            
            <p className="text-gray-600 mb-6">{eventoData.mensajeBienvenida}</p>
            
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
              <span className="text-3xl">🧸</span>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-xs text-gray-500 mb-1 font-semibold">Fecha</p>
                <p className="font-bold text-gray-900 text-sm">
                  {eventoData.configuracion?.fecha 
                    ? formatDateSpanish(eventoData.configuracion.fecha) 
                    : 'Por definir'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-3xl mb-2">🕐</div>
                <p className="text-xs text-gray-500 mb-1 font-semibold">Hora</p>
                <p className="font-bold text-gray-900 text-sm">
                  {eventoData.configuracion?.hora 
                    ? format12Hour(eventoData.configuracion.hora) 
                    : 'Por definir'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-3xl mb-2">📍</div>
                <p className="text-xs text-gray-500 mb-1 font-semibold">Lugar</p>
                <p className="font-bold text-gray-900 text-sm">
                  {eventoData.configuracion?.lugar || 'Por definir'}
                </p>
              </div>
            </div>
            
            {eventoData.configuracion?.mensaje && (
              <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
                <p className="text-gray-700 italic text-lg">"{eventoData.configuracion.mensaje}"</p>
              </div>
            )}
            
            {eventoData.configuracion?.personalizada?.genero && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full font-semibold border-2 border-purple-300">
                  <span>🎀</span>
                  <span>{eventoData.configuracion.personalizada.genero}</span>
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 p-6 text-center">
            <p className="text-purple-600 font-bold text-lg">✨ ¡Te esperamos! ✨</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl">🎈</span>
              <span className="text-2xl">🧸</span>
              <span className="text-2xl">🎀</span>
              <span className="text-2xl">⭐</span>
              <span className="text-2xl">🎈</span>
            </div>
          </div>
        </div>
      );
    }
    
    // DISEÑO 2: Baby Shower Moderno Minimalista (azul-bebe, verde-natural)
    if (design === 'azul-bebe' || design === 'verde-natural') {
      const isBlue = design === 'azul-bebe';
      const gradientFrom = isBlue ? 'from-blue-500' : 'from-green-500';
      const gradientTo = isBlue ? 'to-cyan-500' : 'to-emerald-500';
      const bgGradient = isBlue ? 'from-blue-50 via-cyan-50 to-blue-50' : 'from-green-50 via-emerald-50 to-green-50';
      
      return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-100">
          <div className={`p-12 text-center bg-gradient-to-br ${bgGradient}`}>
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-6">
              BABY SHOWER
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              {eventoData.configuracion?.personalizada?.nombreBebe || 'Nombre del Bebé'}
            </h1>
            <p className="text-gray-600 text-lg">{eventoData.subtitulo}</p>
          </div>
          
          <div className="p-8">
            {eventoData.configuracion?.personalizada?.padres && (
              <div className="text-center mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <p className="text-gray-600 mb-2">Organizan</p>
                <p className="font-bold text-gray-900 text-lg">{eventoData.configuracion.personalizada.padres}</p>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm text-gray-500 mb-1">Fecha</p>
                <p className="font-bold text-gray-900">
                  {eventoData.configuracion?.fecha ? formatDateSpanish(eventoData.configuracion.fecha) : '—'}
                </p>
              </div>
              <div className="text-center p-6 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                <div className="text-4xl mb-3">🕐</div>
                <p className="text-sm text-gray-500 mb-1">Hora</p>
                <p className="font-bold text-gray-900">
                  {eventoData.configuracion?.hora ? format12Hour(eventoData.configuracion.hora) : '—'}
                </p>
              </div>
              <div className="text-center p-6 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50 to-white">
                <div className="text-4xl mb-3">📍</div>
                <p className="text-sm text-gray-500 mb-1">Lugar</p>
                <p className="font-bold text-gray-900 text-sm">
                  {eventoData.configuracion?.lugar || '—'}
                </p>
              </div>
            </div>
            
            {eventoData.configuracion?.mensaje && (
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl mb-6">
                <p className="text-gray-700 italic">"{eventoData.configuracion.mensaje}"</p>
              </div>
            )}
          </div>
          
          <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-center`}>
            <p className="text-white font-bold text-lg">✨ ¡Te esperamos! ✨</p>
          </div>
        </div>
      );
    }
    
    // DISEÑO 3: Baby Shower Temático con Osito (dorado-lujo, arcoiris)
    if (design === 'dorado-lujo' || design === 'arcoiris') {
      return (
        <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-6xl opacity-50">🎈</div>
          <div className="absolute top-4 right-4 text-6xl opacity-50">⭐</div>
          <div className="absolute bottom-4 left-4 text-6xl opacity-50">🧸</div>
          <div className="absolute bottom-4 right-4 text-6xl opacity-50">🎀</div>
          
          <div className="relative z-10 bg-white/90 backdrop-blur rounded-2xl p-8 text-center">
            <div className="text-7xl mb-6">🧸</div>
            
            <p className="text-purple-600 font-semibold mb-2">¡Baby Shower!</p>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {eventoData.configuracion?.personalizada?.nombreBebe || 'Nombre del Bebé'}
            </h1>
            
            {eventoData.configuracion?.personalizada?.padres && (
              <p className="text-gray-600 mb-6">
                👨‍👩‍👧 {eventoData.configuracion.personalizada.padres}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-2 my-6">
              <span className="text-2xl">🎀</span>
              <div className="h-px w-24 bg-purple-300"></div>
              <span className="text-2xl">🧸</span>
              <div className="h-px w-24 bg-purple-300"></div>
              <span className="text-2xl">🎀</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">📅</span>
                <span className="text-gray-700 font-medium">
                  {eventoData.configuracion?.fecha ? formatDateSpanish(eventoData.configuracion.fecha) : 'Por definir'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🕐</span>
                <span className="text-gray-700 font-medium">
                  {eventoData.configuracion?.hora ? format12Hour(eventoData.configuracion.hora) : 'Por definir'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">📍</span>
                <span className="text-gray-700 font-medium">
                  {eventoData.configuracion?.lugar || 'Por definir'}
                </span>
              </div>
            </div>
            
            {eventoData.configuracion?.mensaje && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-gray-700 italic">"{eventoData.configuracion.mensaje}"</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // DISEÑO POR DEFECTO
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-4">
          {eventoData.tituloPrincipal || '¡Evento Especial!'}
        </h1>
        <p className="text-center text-gray-600 mb-2">{eventoData.subtitulo}</p>
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-2">
          {eventoData.configuracion?.personalizada?.nombreBebe || 'Nombre del Bebé'}
        </h2>
        {eventoData.configuracion?.personalizada?.padres && (
          <p className="text-center text-gray-700 font-medium mb-4">
            👨‍👩‍👧 {eventoData.configuracion.personalizada.padres}
          </p>
        )}
        <p className="text-center text-gray-600 mb-8">{eventoData.mensajeBienvenida}</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 mb-2">Fecha</h3>
            <p className="text-gray-600">
              {eventoData.configuracion?.fecha 
                ? formatDateSpanish(eventoData.configuracion.fecha) 
                : 'Por definir'}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🕐</div>
            <h3 className="font-bold text-gray-900 mb-2">Hora</h3>
            <p className="text-gray-600">
              {eventoData.configuracion?.hora 
                ? format12Hour(eventoData.configuracion.hora) 
                : 'Por definir'}
            </p>
          </div>
        </div>
        
        {eventoData.configuracion?.lugar && (
          <div className="bg-purple-50 rounded-xl p-6 text-center mb-8">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-bold text-gray-900 mb-2">Lugar</h3>
            <p className="text-gray-600">{eventoData.configuracion.lugar}</p>
          </div>
        )}
        
        {eventoData.configuracion?.mensaje && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center mb-8">
            <p className="text-gray-700 italic">"{eventoData.configuracion.mensaje}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Playfair+Display:wght@400;700&family=Georgia&family=Poppins&family=Montserrat&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
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
      `}</style>

      {currentSection === 'form' && eventoData && (
        <GenericInvitationForm 
          eventId={eventoData.id}
          eventName={eventoData.nombre}
          onGuestCreated={handleGuestCreated}
        />
      )}

      {guestData && eventoData && currentSection !== 'form' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col items-center space-y-8">
              
              {/* Contenedor para plantilla - Ajustado para dimensiones personalizadas */}
              <div className="w-full flex justify-center">
                <div 
                  className="w-full"
                  style={{ 
                    maxWidth: plantilla?.anchoPlantilla 
                      ? Math.min(plantilla.anchoPlantilla, 800) 
                      : '672px' 
                  }}
                >
                  {plantilla ? (
                    <InvitationRenderer
                      plantilla={plantilla}
                      eventData={eventoData}
                      onConfirm={() => setCurrentSection('rsvp')}
                      onGifts={() => setCurrentSection('gifts')}
                      currentSection={currentSection}
                    />
                  ) : (
                    renderDesign()
                  )}
                </div>
              </div>
              
              {/* Botones centrados debajo de la tarjeta - SOLO en info */}
              {currentSection === 'info' && (
                <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                  
                  {/* Mostrar botón Confirmar - SI NO ha confirmado */}
                  {!guestData.confirmado && (
                    <button
                      onClick={() => setCurrentSection('rsvp')}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                      ✨ Confirmar Asistencia
                    </button>
                  )}
                  
                  {/* Mostrar botón Ver Regalos - Si confirmó pero NO seleccionó regalo */}
                  {guestData.confirmado && !guestData.regaloSeleccionado && (
                    <button
                      onClick={() => setCurrentSection('gifts')}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                      🎁 Ver Lista de Regalos
                    </button>
                  )}
                  
                  {/* SIN BOTONES - Si ya confirmó y seleccionó regalo */}
                  {guestData.confirmado && guestData.regaloSeleccionado && (
                    <div className="text-center py-4">
                      <p className="text-green-600 font-semibold text-lg">
                        ✅ ¡Gracias por confirmar!
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Tu regalo ha sido registrado
                      </p>
                    </div>
                  )}
                  
                </div>
              )}
              
            </div>
            
            {/* Sección RSVP */}
            {currentSection === 'rsvp' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8">
                <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">
                  Confirmación de Asistencia
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  ¡Hola, {guestData.nombre}! Por favor confirma tu presencia
                </p>
                <div className="text-center space-y-4">
                  <button
                    onClick={confirmAttendance}
                    disabled={confirming}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg disabled:opacity-50"
                  >
                    {confirming ? '⏳ Confirmando...' : '✅ Confirmar Asistencia'}
                  </button>
                  <button
                    onClick={() => setCurrentSection('info')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
                  >
                    ← Volver a la Invitación
                  </button>
                </div>
              </div>
            )}
            
            {/* Sección Confirmation */}
            {currentSection === 'confirmation' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8 text-center">
                <div className="text-7xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  ¡Confirmación Exitosa!
                </h2>
                <p className="text-gray-600 mb-6">
                  Gracias por confirmar tu asistencia.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => setCurrentSection('gifts')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg"
                  >
                    🎁 Ver Lista de Regalos
                  </button>
                  {eventoData?.configuracion?.mapaUrl && (
                    <a
                      href={eventoData.configuracion.mapaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                      📍 Ver Ubicación del Evento
                    </a>
                  )}
                  <button
                    onClick={() => setCurrentSection('info')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
                  >
                    ← Volver a la Invitación
                  </button>
                </div>
              </div>
            )}
            
            {/* Sección Gifts */}
            {currentSection === 'gifts' && (
              <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8">
                <h2 className="text-3xl font-bold text-center text-purple-600 mb-2">
                  Lista de Regalos
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  Selecciona los regalos que deseas dar y confirma tu selección
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {gifts.map((gift, index) => (
                    <div
                      key={gift.id}
                      className={`border-2 rounded-xl p-6 transition cursor-pointer ${
                        selectedGiftId === gift.id
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : gift.disponible
                          ? 'border-purple-200 hover:shadow-lg hover:border-purple-300'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => gift.disponible && setSelectedGiftId(gift.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedGiftId === gift.id}
                            onChange={() => {}}
                            disabled={!gift.disponible}
                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-4xl mb-3">{gift.imagen || '🎁'}</div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {gift.nombre}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm mb-2">
                            {gift.ilimitado ? (
                              <span className="text-blue-600 font-semibold">
                                ♾️ Stock Ilimitado
                              </span>
                            ) : (
                              <span className="text-gray-600">
                                📦 Stock: <strong>{gift.stock}</strong> disponible
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {gift.disponible ? (
                              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                                ✅ Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                                ❌ Agotado
                              </span>
                            )}
                            {gift.seleccionado && (
                              <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium ml-2">
                                🎯 Seleccionado por ti
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedGiftId && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-gray-700 font-semibold mb-1">
                          🎁 Regalo seleccionado:
                        </p>
                        <p className="text-purple-900 font-bold text-lg">
                          {gifts.find(g => g.id === selectedGiftId)?.nombre}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedGiftId(null)}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => selectedGiftId && selectGift(selectedGiftId)}
                          disabled={confirming}
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50"
                        >
                          {confirming ? '⏳ Confirmando...' : '✅ Confirmar Selección'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {guestData.regaloSeleccionado && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                    <p className="text-green-800 font-semibold text-lg">
                      ✅ Ya has seleccionado un regalo
                    </p>
                    <p className="text-green-600 mt-2">
                      {gifts.find(g => g.id === guestData.regaloSeleccionado)?.nombre}
                    </p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setCurrentSection('info')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
                  >
                    ← Volver a la Invitación
                  </button>
                </div>
              </div>
            )}
            
            {/* Sección Thank You */}
            {currentSection === 'thankyou' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8 text-center">
                <div className="text-7xl mb-6">🎊</div>
                <h2 className="text-3xl font-bold text-purple-600 mb-4">
                  ¡Gracias por ser parte de este momento especial!
                </h2>
                <p className="text-gray-600 mb-6">
                  Tu presencia y regalo hacen que este día sea aún más memorable.
                </p>
                {eventoData?.configuracion?.mapaUrl && (
                  <a
                    href={eventoData.configuracion.mapaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105"
                  >
                    📍 Ver Ubicación del Evento
                  </a>
                )}
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <p className="text-gray-700 text-lg font-medium">Cargando invitación...</p>
        </div>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}