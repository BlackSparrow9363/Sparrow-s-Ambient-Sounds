import { useSoundStore } from '@/stores/sound';

import styles from './range/range.module.css';

interface SpeedRangeProps {
  id: string;
  label: string;
}

export function SpeedRange({ id, label }: SpeedRangeProps) {
  const setRate = useSoundStore(state => state.setRate);
  const rate = useSoundStore(state => state.sounds[id].rate);
  const isSelected = useSoundStore(state => state.sounds[id].isSelected);
  const locked = useSoundStore(state => state.locked);

  return (
    <input
      aria-label={`${label} sound speed`}
      autoComplete="off"
      className={styles.range}
      disabled={!isSelected}
      max={150}
      min={50}
      step={5}
      type="range"
      value={rate * 100}
      onClick={e => e.stopPropagation()}
      onChange={e =>
        !locked && isSelected && setRate(id, Number(e.target.value) / 100)
      }
    />
  );
}
