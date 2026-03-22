// src/hooks/useGuestLogic.ts
import { useState } from 'react';
import { doc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useGuestLogic = (token: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmAttendance = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const guestRef = doc(db, 'invitados', token);
      await updateDoc(guestRef, {
        confirmado: true,
        fechaConfirmacion: Timestamp.now(),
      });
    } catch (err) {
      setError('Error al confirmar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectGift = async (giftId: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const guestRef = doc(db, 'invitados', token);
      const giftRef = doc(db, 'regalos', giftId);

      await runTransaction(db, async (transaction) => {
        const guestSnap = await transaction.get(guestRef);
        const giftSnap = await transaction.get(giftRef);

        if (!guestSnap.exists() || !giftSnap.exists()) {
          throw "Documento no encontrado";
        }

        const guestData = guestSnap.data();
        const giftData = giftSnap.data();

        if (guestData?.regaloSeleccionado) {
          throw "Ya has seleccionado un regalo anteriormente.";
        }

        const currentStock = giftData?.stock || 0;
        if (currentStock <= 0) {
          throw "Lo sentimos, este regalo se acaba de agotar.";
        }

        const newStock = currentStock - 1;
        const isAvailable = newStock > 0;

        transaction.update(giftRef, {
          stock: newStock,
          disponible: isAvailable
        });

        transaction.update(guestRef, {
          regaloSeleccionado: giftId
        });
      });
    } catch (err: any) {
      setError(err.message || 'Error al seleccionar regalo.');
    } finally {
      setLoading(false);
    }
  };

  return { confirmAttendance, selectGift, loading, error };
};