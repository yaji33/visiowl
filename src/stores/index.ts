import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { WalletProfile } from "@/types";

interface ScoreState {
  profile: WalletProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (p: WalletProfile) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useScoreStore = create<ScoreState>()(
  devtools(
    (set) => ({
      profile: null, isLoading: false, error: null,
      setProfile: (profile) => set({ profile, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError:   (error)     => set({ error, isLoading: false }),
      reset:      ()          => set({ profile: null, isLoading: false, error: null }),
    }),
    { name: "ScoreStore" },
  ),
);

interface UIState {
  isConnectModalOpen: boolean;
  openConnectModal: () => void;
  closeConnectModal: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isConnectModalOpen: false,
      openConnectModal:  () => set({ isConnectModalOpen: true }),
      closeConnectModal: () => set({ isConnectModalOpen: false }),
    }),
    { name: "UIStore" },
  ),
);
