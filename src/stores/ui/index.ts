import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UIState = {
  focusMode: boolean;
  setFocusMode: (focusMode: boolean) => void;
  toggleFocusMode: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      focusMode: false,
      setFocusMode: focusMode => set({ focusMode }),
      toggleFocusMode: () =>
        set(state => ({
          focusMode: !state.focusMode,
        })),
    }),
    {
      name: 'sparrow-ui',
      partialize: state => ({
        focusMode: state.focusMode,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
