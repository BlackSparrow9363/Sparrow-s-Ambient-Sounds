import type { StateCreator } from 'zustand';

import type { SoundState } from './sound.state';

import { pickMany, random } from '@/helpers/random';

export interface SoundActions {
  lock: () => void;
  override: (sounds: Record<string, number>) => void;
  pause: () => void;
  play: () => void;
  restoreHistory: () => void;
  select: (id: string) => void;
  setGlobalVolume: (volume: number) => void;
  setRate: (id: string, rate: number) => void;
  setVolume: (id: string, volume: number) => void;
  shuffle: () => void;
  toggleFavorite: (id: string) => void;
  togglePlay: () => void;
  unlock: () => void;
  unselect: (id: string) => void;
  unselectAll: (pushToHistory?: boolean) => void;
}

export const createActions: StateCreator<
  SoundActions & SoundState,
  [],
  [],
  SoundActions
> = (set, get) => {
  const resetSound = (sound: SoundState['sounds'][string]) => ({
    ...sound,
    isSelected: false,
    rate: 1,
    volume: 0.5,
  });

  return {
    lock() {
      set({ locked: true });
    },

    override(newSounds) {
      const sounds = Object.fromEntries(
        Object.entries(get().sounds).map(([id, sound]) => [id, resetSound(sound)]),
      ) as SoundState['sounds'];

      Object.keys(newSounds).forEach(sound => {
        if (sounds[sound]) {
          sounds[sound] = {
            ...sounds[sound],
            isSelected: true,
            rate: 1,
            volume: newSounds[sound],
          };
        }
      });

      set({ history: null, isPlaying: true, sounds });
    },

    pause() {
      set({ isPlaying: false });
    },

    play() {
      set({ isPlaying: true });
    },

    restoreHistory() {
      const history = get().history;

      if (!history) return;

      set({ history: null, sounds: history });
    },

    select(id) {
      set({
        history: null,
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], isSelected: true },
        },
      });
    },

    setGlobalVolume(volume) {
      set({
        globalVolume: volume,
      });
    },

    setRate(id, rate) {
      set({
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], rate },
        },
      });
    },

    setVolume(id, volume) {
      set({
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], volume },
        },
      });
    },

    shuffle() {
      const sounds = Object.fromEntries(
        Object.entries(get().sounds).map(([id, sound]) => [id, resetSound(sound)]),
      ) as SoundState['sounds'];
      const ids = Object.keys(sounds);

      const randomIDs = pickMany(ids, 4);

      randomIDs.forEach(id => {
        sounds[id] = {
          ...sounds[id],
          isSelected: true,
          rate: 1,
          volume: random(0.2, 1),
        };
      });

      set({ history: null, isPlaying: true, sounds });
    },

    toggleFavorite(id) {
      const sounds = get().sounds;
      const sound = sounds[id];

      set({
        history: null,
        sounds: {
          ...sounds,
          [id]: { ...sound, isFavorite: !sound.isFavorite },
        },
      });
    },

    togglePlay() {
      set({ isPlaying: !get().isPlaying });
    },

    unlock() {
      set({ locked: false });
    },

    unselect(id) {
      set({
        sounds: {
          ...get().sounds,
          [id]: { ...get().sounds[id], isSelected: false, rate: 1 },
        },
      });
    },

    unselectAll(pushToHistory = false) {
      const noSelected = get().noSelected();

      if (noSelected) return;

      const currentSounds = get().sounds;

      if (pushToHistory) {
        const history = JSON.parse(JSON.stringify(currentSounds));
        set({ history });
      }

      const sounds = Object.fromEntries(
        Object.entries(currentSounds).map(([id, sound]) => [id, resetSound(sound)]),
      ) as SoundState['sounds'];

      set({ isPlaying: false, sounds });
    },
  };
};
