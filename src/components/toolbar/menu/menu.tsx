import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5/index';
import { IoMdFlower, IoIosMusicalNote } from 'react-icons/io/index';
import {
  IoMoonSharp,
  IoShareSocialSharp,
  IoSunnyOutline,
} from 'react-icons/io5/index';
import { BiShuffle } from 'react-icons/bi/index';
import { FaHeadphonesAlt } from 'react-icons/fa/index';
import {
  MdKeyboardCommandKey,
  MdNotes,
  MdOutlineAvTimer,
  MdOutlineCenterFocusStrong,
  MdOutlineTimer,
  MdTaskAlt,
} from 'react-icons/md/index';
import { RiPlayListFill } from 'react-icons/ri/index';
import { TbWaveSine } from 'react-icons/tb/index';
import { useHotkeys } from 'react-hotkeys-hook';
import { AnimatePresence, motion } from 'motion/react';

import { ShareLinkModal } from '@/components/modals/share-link';
import { PresetsModal } from '@/components/modals/presets';
import { ShortcutsModal } from '@/components/modals/shortcuts';
import { SleepTimerModal } from '@/components/modals/sleep-timer';
import { BreathingExerciseModal } from '@/components/modals/breathing';
import { BinauralModal } from '@/components/modals/binaural';
import { IsochronicModal } from '@/components/modals/isochronic';
import { LofiModal } from '@/components/modals/lofi';
import { Pomodoro, Notepad, Todo, Countdown } from '@/components/toolbox';
import { Slider } from '@/components/slider';

import { fade, mix, slideX, slideY } from '@/lib/motion';
import { useSoundStore } from '@/stores/sound';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useSleepTimerStore } from '@/stores/sleep-timer';
import { useNoteStore } from '@/stores/note';
import { useTodoStore } from '@/stores/todo';
import { useUIStore } from '@/stores/ui';

import styles from './menu.module.css';
import { useCloseListener } from '@/hooks/use-close-listener';
import { closeModals } from '@/lib/modal';
import { useTheme } from '@/hooks/use-theme';

type ToolCard = {
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  id: string;
  label: string;
  meta?: string;
  onClick: () => void;
  shortcut?: string;
  status?: string;
};

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const noSelected = useSoundStore(state => state.noSelected());
  const locked = useSoundStore(state => state.locked);
  const shuffle = useSoundStore(state => state.shuffle);
  const globalVolume = useSoundStore(state => state.globalVolume);
  const setGlobalVolume = useSoundStore(state => state.setGlobalVolume);
  const pomodoroRunning = usePomodoroStore(state => state.running);
  const sleepTimerActive = useSleepTimerStore(state => state.active);
  const note = useNoteStore(state => state.note);
  const todoCount = useTodoStore(state => state.todos.length);
  const completedTodoCount = useTodoStore(
    state => state.todos.filter(todo => todo.done).length,
  );
  const { isDarkTheme, toggleTheme } = useTheme();
  const focusMode = useUIStore(state => state.focusMode);
  const toggleFocusMode = useUIStore(state => state.toggleFocusMode);

  const initial = useMemo(
    () => ({
      binaural: false,
      breathing: false,
      countdown: false,
      isochronic: false,
      lofi: false,
      notepad: false,
      pomodoro: false,
      presets: false,
      shareLink: false,
      shortcuts: false,
      sleepTimer: false,
      todo: false,
    }),
    [],
  );

  const [modals, setModals] = useState(initial);

  const close = useCallback((name: string) => {
    setModals(prev => ({ ...prev, [name]: false }));
  }, []);

  const closeAll = useCallback(() => setModals(initial), [initial]);

  const open = useCallback(
    (name: string) => {
      closeAll();
      setIsOpen(false);
      closeModals();
      setModals(prev => ({ ...prev, [name]: true }));
    },
    [closeAll],
  );

  const triggerShuffle = useCallback(() => {
    if (locked) return;
    setIsOpen(false);
    shuffle();
  }, [locked, shuffle]);

  useHotkeys('shift+m', () => setIsOpen(prev => !prev));
  useHotkeys('shift+alt+p', () => open('presets'));
  useHotkeys('shift+h', () => open('shortcuts'));
  useHotkeys('shift+b', () => open('breathing'));
  useHotkeys('shift+n', () => open('notepad'));
  useHotkeys('shift+p', () => open('pomodoro'));
  useHotkeys('shift+t', () => open('todo'));
  useHotkeys('shift+c', () => open('countdown'));
  useHotkeys('shift+s', () => open('shareLink'), { enabled: !noSelected });
  useHotkeys('shift+alt+t', () => open('sleepTimer'));
  useHotkeys('escape', () => setIsOpen(false), { enabled: isOpen });

  useCloseListener(() => {
    closeAll();
    setIsOpen(false);
  });

  const drawerVariants = mix(fade(), slideX(24));
  const backdropVariants = fade();
  const buttonVariants = mix(fade(), slideY(8));

  const quickActions: Array<ToolCard> = [
    {
      description: 'Save, reopen, and manage your custom sound blends.',
      icon: <RiPlayListFill />,
      id: 'presets',
      label: 'Presets',
      onClick: () => open('presets'),
      shortcut: 'Shift + Alt + P',
    },
    {
      description: 'Create a shareable link for the sounds in your current mix.',
      disabled: noSelected,
      icon: <IoShareSocialSharp />,
      id: 'share',
      label: 'Share Mix',
      onClick: () => open('shareLink'),
      shortcut: 'Shift + S',
    },
    {
      description: 'Generate a random layered ambience in one tap.',
      disabled: locked,
      icon: <BiShuffle />,
      id: 'shuffle',
      label: 'Shuffle',
      onClick: triggerShuffle,
    },
    {
      description: 'Fade the session out automatically when it is time to rest.',
      icon: <IoMoonSharp />,
      id: 'sleep-timer',
      label: 'Sleep Timer',
      onClick: () => open('sleepTimer'),
      shortcut: 'Shift + Alt + T',
      status: sleepTimerActive ? 'Active' : undefined,
    },
  ];

  const focusTools: Array<ToolCard> = [
    {
      description: 'Set a simple timer for breaks, sprints, or reminders.',
      icon: <MdOutlineTimer />,
      id: 'countdown',
      label: 'Countdown Timer',
      onClick: () => open('countdown'),
      shortcut: 'Shift + C',
    },
    {
      description: 'Run structured focus and rest cycles while you listen.',
      icon: <MdOutlineAvTimer />,
      id: 'pomodoro',
      label: 'Pomodoro',
      onClick: () => open('pomodoro'),
      shortcut: 'Shift + P',
      status: pomodoroRunning ? 'Running' : undefined,
    },
    {
      description: 'Open guided breathing patterns without leaving the app.',
      icon: <IoMdFlower />,
      id: 'breathing',
      label: 'Breathing Exercise',
      onClick: () => open('breathing'),
      shortcut: 'Shift + B',
    },
  ];

  const workspaceTools: Array<ToolCard> = [
    {
      description: 'Capture quick notes beside your current sound setup.',
      icon: <MdNotes />,
      id: 'notepad',
      label: 'Notepad',
      onClick: () => open('notepad'),
      shortcut: 'Shift + N',
      status: note.length ? 'Saved' : undefined,
    },
    {
      description: 'Track lightweight tasks while you work and listen.',
      icon: <MdTaskAlt />,
      id: 'todo',
      label: 'Todo Checklist',
      meta:
        todoCount > 0
          ? `${completedTodoCount}/${todoCount} complete`
          : 'No tasks yet',
      onClick: () => open('todo'),
      shortcut: 'Shift + T',
    },
    {
      description: 'See every keyboard command in one place.',
      icon: <MdKeyboardCommandKey />,
      id: 'shortcuts',
      label: 'Shortcuts',
      onClick: () => open('shortcuts'),
      shortcut: 'Shift + H',
    },
  ];

  const generators: Array<ToolCard> = [
    {
      description: 'Add stereo beat patterns designed for focus or relaxation.',
      icon: <FaHeadphonesAlt />,
      id: 'binaural',
      label: 'Binaural Beats',
      onClick: () => open('binaural'),
    },
    {
      description: 'Layer pulsing tones for meditative or concentration sessions.',
      icon: <TbWaveSine />,
      id: 'isochronic',
      label: 'Isochronic Tones',
      onClick: () => open('isochronic'),
    },
    {
      description: 'Bring in a lofi stream when you want music with ambience.',
      icon: <IoIosMusicalNote />,
      id: 'lofi',
      label: 'Lofi Music',
      onClick: () => open('lofi'),
    },
  ];

  const settingsCards: Array<ToolCard> = [
    {
      description: isDarkTheme
        ? 'Switch to a brighter daytime interface.'
        : 'Switch to a darker nighttime interface.',
      icon: isDarkTheme ? <IoSunnyOutline /> : <IoMoonSharp />,
      id: 'theme-toggle',
      label: isDarkTheme ? 'Day Mode' : 'Night Mode',
      onClick: toggleTheme,
      status: isDarkTheme ? 'Night' : 'Day',
    },
    {
      description: focusMode
        ? 'Bring the full browsing layout back.'
        : 'Hide extra chrome and keep the workspace calmer.',
      icon: <MdOutlineCenterFocusStrong />,
      id: 'focus-toggle',
      label: focusMode ? 'Exit Focus' : 'Focus Mode',
      onClick: toggleFocusMode,
      status: focusMode ? 'Active' : undefined,
    },
  ];

  const renderCards = (cards: Array<ToolCard>) => (
    <div className={styles.cardGrid}>
      {cards.map(card => (
        <button
          key={card.id}
          className={styles.card}
          disabled={card.disabled}
          onClick={card.onClick}
        >
          <div className={styles.cardTop}>
            <span className={styles.cardIcon}>{card.icon}</span>
            {card.status && <span className={styles.cardStatus}>{card.status}</span>}
          </div>

          <div className={styles.cardLabel}>{card.label}</div>
          <p className={styles.cardDescription}>{card.description}</p>

          {(card.shortcut || card.meta) && (
            <div className={styles.cardMeta}>
              {card.shortcut && <span>{card.shortcut}</span>}
              {card.meta && <span>{card.meta}</span>}
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.wrapper}>
        <motion.button
          animate="show"
          aria-label={isOpen ? 'Close Tools' : 'Open Tools'}
          className={styles.menuButton}
          initial="hidden"
          variants={buttonVariants}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span className={styles.menuButtonIcon}>
            {isOpen ? <IoClose /> : <IoMenu />}
          </span>
          <span className={styles.menuButtonLabel}>Tools</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                animate="show"
                className={styles.backdrop}
                exit="hidden"
                initial="hidden"
                variants={backdropVariants}
                onClick={() => setIsOpen(false)}
              />

              <motion.aside
                animate="show"
                className={styles.menu}
                exit="hidden"
                initial="hidden"
                variants={drawerVariants}
              >
                <div className={styles.menuTop}>
                  <div className={styles.menuHeader}>
                    <span className={styles.menuEyebrow}>Command Deck</span>
                    <div className={styles.menuHeading}>Tools and extra generators</div>
                    <p className={styles.menuTitle}>
                      Browse every helper from a proper side drawer instead of a
                      cramped popup list.
                    </p>
                  </div>

                  <button
                    aria-label="Close tools"
                    className={styles.closeButton}
                    onClick={() => setIsOpen(false)}
                  >
                    <IoClose />
                  </button>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Quick Actions</span>
                    <span className={styles.sectionHint}>Session controls</span>
                  </div>

                  {renderCards(quickActions)}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Focus Tools</span>
                    <span className={styles.sectionHint}>
                      Timers and guided helpers
                    </span>
                  </div>

                  {renderCards(focusTools)}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Workspace Tools</span>
                    <span className={styles.sectionHint}>
                      Notes, tasks, and shortcuts
                    </span>
                  </div>

                  {renderCards(workspaceTools)}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Generators</span>
                    <span className={styles.sectionHint}>Extra audio layers</span>
                  </div>

                  {renderCards(generators)}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Settings</span>
                    <span className={styles.sectionHint}>Theme and layout</span>
                  </div>

                  {renderCards(settingsCards)}

                  <div className={`${styles.globalVolume} ${styles.sliderCard}`}>
                    <label htmlFor="global-volume">Global Volume</label>
                    <Slider
                      max={100}
                      min={0}
                      value={globalVolume * 100}
                      onChange={value => setGlobalVolume(value / 100)}
                    />
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <ShareLinkModal
        show={modals.shareLink}
        onClose={() => close('shareLink')}
      />
      <BreathingExerciseModal
        show={modals.breathing}
        onClose={() => close('breathing')}
      />
      <ShortcutsModal
        show={modals.shortcuts}
        onClose={() => close('shortcuts')}
      />
      <Pomodoro
        open={() => open('pomodoro')}
        show={modals.pomodoro}
        onClose={() => close('pomodoro')}
      />
      <Notepad show={modals.notepad} onClose={() => close('notepad')} />
      <Todo show={modals.todo} onClose={() => close('todo')} />
      <Countdown show={modals.countdown} onClose={() => close('countdown')} />
      <PresetsModal show={modals.presets} onClose={() => close('presets')} />
      <SleepTimerModal
        show={modals.sleepTimer}
        onClose={() => close('sleepTimer')}
      />
      <BinauralModal show={modals.binaural} onClose={() => close('binaural')} />
      <IsochronicModal
        show={modals.isochronic}
        onClose={() => close('isochronic')}
      />
      <LofiModal show={modals.lofi} onClose={() => close('lofi')} />
    </>
  );
}
