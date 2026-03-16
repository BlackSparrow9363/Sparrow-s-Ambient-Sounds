import { BiHeart, BiSolidHeart } from 'react-icons/bi/index';
import { AnimatePresence, motion } from 'motion/react';

import { useSoundStore } from '@/stores/sound';
import { cn } from '@/helpers/styles';
import { fade } from '@/lib/motion';

import styles from './favorite.module.css';

import { useKeyboardButton } from '@/hooks/use-keyboard-button';

interface FavoriteProps {
  id: string;
  label: string;
}

export function Favorite({ id, label }: FavoriteProps) {
  const isFavorite = useSoundStore(state => state.sounds[id].isFavorite);
  const toggleFavorite = useSoundStore(state => state.toggleFavorite);

  const handleToggle = () => {
    toggleFavorite(id);
  };

  const variants = fade();

  const handleKeyDown = useKeyboardButton(handleToggle);

  return (
    <AnimatePresence initial={false} mode="wait">
      <button
        className={cn(styles.favoriteButton, isFavorite && styles.isFavorite)}
        aria-label={
          isFavorite
            ? `Remove ${label} Sound from Favorites`
            : `Add ${label} Sound to Favorites`
        }
        onKeyDown={handleKeyDown}
        onClick={e => {
          e.stopPropagation();
          handleToggle();
        }}
      >
        <motion.span
          animate="show"
          aria-hidden="true"
          exit="hidden"
          initial="hidden"
          key={isFavorite ? `${id}-is-favorite` : `${id}-not-favorite`}
          variants={variants}
        >
          {isFavorite ? <BiSolidHeart /> : <BiHeart />}
        </motion.span>
      </button>
    </AnimatePresence>
  );
}
