// src/components/Modal.tsx
'use client';
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalState {
  open: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const icons: Record<ModalType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '📋',
  confirm: '❓',
};

const colors: Record<ModalType, { bg: string; border: string; button: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-300', button: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' },
  error: { bg: 'bg-red-50', border: 'border-red-300', button: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', button: 'from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600' },
  info: { bg: 'bg-blue-50', border: 'border-blue-300', button: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' },
  confirm: { bg: 'bg-purple-50', border: 'border-purple-300', button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
};

// --- Context ---
interface ModalContextValue {
  showAlert: (message: string, type?: ModalType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

// --- Provider ---
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ open: false, type: 'info', title: '', message: '' });

  const close = useCallback(() => setModal(prev => ({ ...prev, open: false })), []);

  const showAlert = useCallback((message: string, type: ModalType = 'info') => {
    const title = type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : type === 'warning' ? 'Atención' : 'Información';
    setModal({ open: true, type, title, message });
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setModal({ open: true, type: 'confirm', title: 'Confirmar', message, onConfirm, onCancel: close });
  }, [close]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={modal.type !== 'confirm' ? close : undefined} />
          {/* modal */}
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border-2 ${colors[modal.type].bg} ${colors[modal.type].border} p-6 animate-modal-in`}>
            <div className="text-center">
              <div className="text-5xl mb-4">{icons[modal.type]}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{modal.message}</p>
            </div>
            <div className={`flex gap-3 ${modal.type === 'confirm' ? 'justify-center' : 'justify-center'}`}>
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => { close(); modal.onCancel?.(); }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { close(); modal.onConfirm?.(); }}
                    className={`px-6 py-3 bg-gradient-to-r ${colors[modal.type].button} text-white font-bold rounded-xl shadow-lg transition`}
                  >
                    Aceptar
                  </button>
                </>
              ) : (
                <button
                  onClick={close}
                  className={`px-8 py-3 bg-gradient-to-r ${colors[modal.type].button} text-white font-bold rounded-xl shadow-lg transition`}
                >
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
