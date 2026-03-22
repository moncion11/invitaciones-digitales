// src/components/BabyShowerContent.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useGuestLogic } from '@/hooks/useGuestLogic';
import InvitationView from '@/components/InvitationView';
import GiftListView from '@/components/GiftListView';

export default function BabyShowerContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('inv');
  const [guestData, setGuestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { confirmAttendance, selectGift, loading: actionLoading, error } = useGuestLogic(token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchGuest = async () => {
      try {
        const docRef = doc(db, 'invitados', token);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGuestData({ id: token, ...docSnap.data() });
        }
      } catch (e) {
        console.error("Error fetching guest", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGuest();
  }, [token]);

  if (loading) return <div className="p-10 text-center text-pink-500">Cargando invitación...</div>;
  if (!token || !guestData) return <div className="p-10 text-center text-red-500">Enlace inválido o expirado.</div>;

  return (
    <main className="min-h-screen bg-pink-50 font-sans text-gray-800">
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen sm:min-h-0 sm:my-10 sm:rounded-2xl overflow-hidden relative">
        
        <div className="h-32 bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Baby Shower</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          {!guestData.confirmado ? (
            <InvitationView 
              guestName={guestData.nombre} 
              onConfirm={confirmAttendance} 
              loading={actionLoading} 
            />
          ) : (
            <GiftListView 
              guestId={token}
              selectedGiftId={guestData.regaloSeleccionado}
              onSelect={selectGift}
              loading={actionLoading}
            />
          )}
        </div>
      </div>
    </main>
  );
}