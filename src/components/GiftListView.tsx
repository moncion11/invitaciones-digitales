// src/components/GiftListView.tsx
'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Gift {
  id: string;
  nombre: string;
  descripcion: string;
  stock: number;
  disponible: boolean;
}

interface Props {
  guestId: string;
  selectedGiftId: string | null;
  onSelect: (giftId: string) => void;
  loading: boolean;
}

export default function GiftListView({ guestId, selectedGiftId, onSelect, loading }: Props) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [myGiftName, setMyGiftName] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'regalos'), where('disponible', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const giftsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Gift[];
      setGifts(giftsList);
    });

    if (selectedGiftId) {
      getDoc(doc(db, 'regalos', selectedGiftId)).then(doc => {
        if (doc.exists()) setMyGiftName(doc.data().nombre);
      });
    }

    return () => unsubscribe();
  }, [selectedGiftId]);

  if (selectedGiftId && myGiftName) {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">¡Gracias!</h3>
        <p className="text-gray-600">Has seleccionado exitosamente:</p>
        <p className="text-xl font-bold text-pink-600 mt-2">{myGiftName}</p>
        <p className="text-sm text-gray-400 mt-8">Te esperamos en el evento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
        Lista de Regalos
        <span className="block text-sm font-normal text-gray-500">Selecciona uno antes de que se agoten</span>
      </h3>

      <div className="grid gap-4">
        {gifts.map((gift) => (
          <div 
            key={gift.id} 
            className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition bg-white"
          >
            <div>
              <h4 className="font-bold text-gray-800">{gift.nombre}</h4>
              <p className="text-sm text-gray-500">{gift.descripcion}</p>
              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full mt-1 inline-block">
                Stock: {gift.stock}
              </span>
            </div>
            <button
              onClick={() => onSelect(gift.id)}
              disabled={loading}
              className="bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? '...' : 'Seleccionar'}
            </button>
          </div>
        ))}
        
        {gifts.length === 0 && (
          <p className="text-center text-gray-500 italic">Todos los regalos han sido seleccionados.</p>
        )}
      </div>
    </div>
  );
}