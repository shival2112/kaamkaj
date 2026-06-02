import { create } from 'zustand';

type ModalRole = 'CANDIDATE' | 'EMPLOYER';
type ModalTab  = 'login' | 'register';

interface ModalState {
  isOpen:    boolean;
  role:      ModalRole | null;
  tab:       ModalTab;
  openLogin:    (role: ModalRole) => void;
  openRegister: (role: ModalRole) => void;
  setTab:    (tab: ModalTab) => void;
  close:     () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  role:   null,
  tab:    'login',
  openLogin:    (role) => set({ isOpen: true, role, tab: 'login' }),
  openRegister: (role) => set({ isOpen: true, role, tab: 'register' }),
  setTab:  (tab)  => set({ tab }),
  close:   ()     => set({ isOpen: false, role: null }),
}));
