import { useCallback, useEffect, forwardRef, useMemo } from 'react';
import { ImSpinner9 } from 'react-icons/im/index';

import { Range } from './range';
import { Favorite } from './favorite';

import { useSound } from '@/hooks/use-sound';
import { useSoundStore } from '@/stores/sound';
import { useLoadingStore } from '@/stores/loading';
import { cn } from '@/helpers/styles';

import styles from './sound.module.css';

import type { Sound as SoundType } from '@/data/types';

import { useKeyboardButton } from '@/hooks/use-keyboard-button';

interface SoundProps extends SoundType {
  functional: boolean;
  hidden: boolean;
  selectHidden: (key: string) => void;
  unselectHidden: (key: string) => void;
}

const speedPresets = [0.75, 1, 1.25];

export const Sound = forwardRef<HTMLDivElement, SoundProps>(function Sound(
  { functional, hidden, icon, id, label, selectHidden, src, unselectHidden },
  ref,
) {
  const isPlaying = useSoundStore(state => state.isPlaying);
  const play = useSoundStore(state => state.play);
  const selectSound = useSoundStore(state => state.select);
  const unselectSound = useSoundStore(state => state.unselect);
  const setRate = useSoundStore(state => state.setRate);
  const setVolume = useSoundStore(state => state.setVolume);
  const isSelected = useSoundStore(state => state.sounds[id].isSelected);
  const locked = useSoundStore(state => state.locked);

  const rate = useSoundStore(state => state.sounds[id].rate);
  const volume = useSoundStore(state => state.sounds[id].volume);
  const globalVolume = useSoundStore(state => state.globalVolume);
  const adjustedVolume = useMemo(
    () => volume * globalVolume,
    [volume, globalVolume],
  );

  const isLoading = useLoadingStore(state => state.loaders[src]);

  const sound = useSound(src, {
    loop: true,
    rate,
    volume: adjustedVolume,
  });

  useEffect(() => {
    if (locked) return;

    if (isSelected && isPlaying && functional) {
      sound?.play();
    } else {
      sound?.pause();
    }
  }, [functional, isPlaying, isSelected, locked, sound]);

  useEffect(() => {
    if (hidden && isSelected) selectHidden(label);
    else if (hidden && !isSelected) unselectHidden(label);
  }, [hidden, isSelected, label, selectHidden, unselectHidden]);

  const select = useCallback(() => {
    if (locked) return;
    selectSound(id);
    play();
  }, [id, locked, play, selectSound]);

  const unselect = useCallback(() => {
    if (locked) return;
    unselectSound(id);
    setRate(id, 1);
    setVolume(id, 0.5);
  }, [id, locked, setRate, setVolume, unselectSound]);

  const toggle = useCallback(() => {
    if (locked) return;
    if (isSelected) unselect();
    else select();
  }, [isSelected, locked, select, unselect]);

  const handleKeyDown = useKeyboardButton(toggle);

  return (
    <div
      aria-label={`${label} sound`}
      data-selected={isSelected ? 'true' : 'false'}
      data-sound-card="true"
      ref={ref}
      role="button"
      tabIndex={0}
      className={cn(
        styles.sound,
        isSelected && styles.selected,
        hidden && styles.hidden,
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <Favorite id={id} label={label} />

      <div className={styles.headerRow}>
        <div className={styles.icon}>
          {isLoading ? (
            <span aria-hidden="true" className={styles.spinner}>
              <ImSpinner9 />
            </span>
          ) : (
            <span aria-hidden="true">{icon}</span>
          )}
        </div>

        {isSelected && (
          <div className={styles.activity} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className={styles.label} id={id}>
        {label}
      </div>

      {isSelected && (
        <div className={styles.controls} onClick={e => e.stopPropagation()}>
          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <Range id={id} label={label} />
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span>Speed</span>
              <span>{rate.toFixed(2)}x</span>
            </div>

            <div className={styles.speedPresets}>
              {speedPresets.map(option => (
                <button
                  key={option}
                  className={cn(
                    styles.speedPreset,
                    Math.abs(rate - option) < 0.01 && styles.speedPresetActive,
                  )}
                  onClick={() => setRate(id, option)}
                >
                  {option.toFixed(2)}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
