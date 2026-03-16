import { useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useShallow } from 'zustand/react/shallow';
import {
  BiSearchAlt2,
  BiSolidHeart,
  BiVolumeFull,
  BiVolumeMute,
  BiX,
} from 'react-icons/bi/index';
import { IoMoonSharp, IoSunnyOutline } from 'react-icons/io5/index';
import { MdFilterAltOff, MdOutlineCenterFocusStrong } from 'react-icons/md/index';
import { Howler } from 'howler';

import { useSoundStore } from '@/stores/sound';
import { useUIStore } from '@/stores/ui';

import { Container } from '@/components/container';
import { StoreConsumer } from '@/components/store-consumer';
import { Buttons } from '@/components/buttons';
import { Sounds } from '@/components/sounds';
import { SharedModal } from '@/components/modals/shared';
import { Toolbar } from '@/components/toolbar';
import { SnackbarProvider } from '@/contexts/snackbar';
import { MediaControls } from '@/components/media-controls';
import { Slider } from '@/components/slider';

import { sounds } from '@/data/sounds';
import { moodPacks } from '@/data/mood-packs';
import { FADE_OUT } from '@/constants/events';

import type { Category, Sound } from '@/data/types';
import { subscribe } from '@/lib/event';
import { useTheme } from '@/hooks/use-theme';
import styles from './app.module.css';

type LibraryFilter = 'all' | 'favorites' | 'selected';

export function App() {
  const categories = useMemo(() => sounds.categories, []);

  const favorites = useSoundStore(useShallow(state => state.getFavorites()));
  const soundState = useSoundStore(state => state.sounds);
  const pause = useSoundStore(state => state.pause);
  const play = useSoundStore(state => state.play);
  const override = useSoundStore(state => state.override);
  const lock = useSoundStore(state => state.lock);
  const unlock = useSoundStore(state => state.unlock);
  const globalVolume = useSoundStore(state => state.globalVolume);
  const setGlobalVolume = useSoundStore(state => state.setGlobalVolume);
  const setRate = useSoundStore(state => state.setRate);
  const setVolume = useSoundStore(state => state.setVolume);
  const unselect = useSoundStore(state => state.unselect);
  const focusMode = useUIStore(state => state.focusMode);
  const toggleFocusMode = useUIStore(state => state.toggleFocusMode);
  const { isDarkTheme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all');
  const mutedVolumeRef = useRef(0.65);

  useHotkeys('shift+f', toggleFocusMode, {}, [toggleFocusMode]);

  const favoriteSounds = useMemo(() => {
    const favoriteSounds = categories
      .map(category => category.sounds)
      .flat()
      .filter(sound => favorites.includes(sound.id));

    return favorites
      .map(favorite => favoriteSounds.find(sound => sound.id === favorite))
      .filter((sound): sound is Sound => !!sound);
  }, [favorites, categories]);

  useEffect(() => {
    const onChange = () => {
      const { ctx } = Howler;

      if (ctx && !document.hidden) {
        setTimeout(() => {
          ctx.resume();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', onChange, false);

    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(FADE_OUT, (e: { duration: number }) => {
      lock();

      setTimeout(() => {
        pause();
        unlock();
      }, e.duration);
    });

    return unsubscribe;
  }, [pause, lock, unlock]);

  useEffect(() => {
    if (globalVolume > 0) {
      mutedVolumeRef.current = globalVolume;
    }
  }, [globalVolume]);

  const allCategories = useMemo(() => {
    const favoriteCategories: Array<Category> = [];

    if (favoriteSounds.length) {
      favoriteCategories.push({
        icon: <BiSolidHeart />,
        id: 'favorites',
        sounds: favoriteSounds,
        title: 'Favorites',
      });
    }

    return [...favoriteCategories, ...categories];
  }, [favoriteSounds, categories]);

  const [activeCategoryId, setActiveCategoryId] = useState(
    favoriteSounds.length ? 'favorites' : categories[0]?.id || '',
  );

  useEffect(() => {
    if (!allCategories.length) return;

    const activeExists = allCategories.some(
      category => category.id === activeCategoryId,
    );

    if (!activeExists) {
      setActiveCategoryId(allCategories[0].id);
    }
  }, [activeCategoryId, allCategories]);

  const activeCategory = useMemo(
    () =>
      allCategories.find(category => category.id === activeCategoryId) ||
      allCategories[0],
    [activeCategoryId, allCategories],
  );

  const soundDetails = useMemo(
    () =>
      categories.flatMap(category =>
        category.sounds.map(sound => ({
          ...sound,
          categoryId: category.id,
          categoryTitle: category.title,
        })),
      ),
    [categories],
  );

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const selectedSounds = useMemo(
    () =>
      soundDetails.filter(sound => soundState[sound.id]?.isSelected).sort((a, b) => {
        if (a.categoryId === activeCategory?.id && b.categoryId !== activeCategory?.id)
          return -1;
        if (b.categoryId === activeCategory?.id && a.categoryId !== activeCategory?.id)
          return 1;
        return a.label.localeCompare(b.label);
      }),
    [activeCategory?.id, soundDetails, soundState],
  );

  const filteredSounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (activeCategory?.sounds || []).filter(sound => {
      if (query && !sound.label.toLowerCase().includes(query)) return false;
      if (libraryFilter === 'favorites' && !favoriteSet.has(sound.id)) return false;
      if (libraryFilter === 'selected' && !soundState[sound.id]?.isSelected) {
        return false;
      }

      return true;
    });
  }, [activeCategory, favoriteSet, libraryFilter, searchQuery, soundState]);

  const totalSelected = selectedSounds.length;
  const hasLibraryFilters = searchQuery.trim().length > 0 || libraryFilter !== 'all';
  const activeCategorySelectedCount = useMemo(
    () =>
      (activeCategory?.sounds || []).filter(sound => soundState[sound.id]?.isSelected)
        .length,
    [activeCategory, soundState],
  );
  const activeMixPreview = selectedSounds.slice(0, 4);
  const hiddenMixCount = Math.max(totalSelected - activeMixPreview.length, 0);
  const visibleLibrarySounds = filteredSounds;
  const visibleLibraryId = activeCategory?.id || 'library';
  const visibleLibraryFunctional = activeCategory?.id !== 'favorites';
  const mountedPlaybackCategories = useMemo(
    () =>
      categories.filter(category =>
        activeCategory?.id === 'favorites' ? true : category.id !== activeCategory?.id,
      ),
    [activeCategory?.id, categories],
  );

  const applyMoodPack = (pack: (typeof moodPacks)[number]) => {
    override(pack.sounds);
    play();
    setActiveCategoryId(pack.categoryId);
    setSearchQuery('');
    setLibraryFilter('all');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLibraryFilter('all');
  };

  const toggleMute = () => {
    if (globalVolume === 0) {
      setGlobalVolume(mutedVolumeRef.current || 0.65);
      return;
    }

    mutedVolumeRef.current = globalVolume || 0.65;
    setGlobalVolume(0);
  };

  return (
    <SnackbarProvider>
      <StoreConsumer>
        <MediaControls />
        <Container
          className={`${styles.shell} ${focusMode ? styles.focusMode : ''}`}
          wide
        >
          <div id="app" />

          <section className={styles.intro}>
            <div className={styles.introCopy}>
              <div className={styles.brand}>
                <img
                  alt="Sparrow logo"
                  className={styles.logo}
                  height={64}
                  src="/logo.svg"
                  width={64}
                />

                <div className={styles.brandText}>
                  <p className={styles.eyebrow}>Sparrow Sound Desk</p>
                  <h2 className={styles.heading}>Browse less. Listen better.</h2>
                </div>
              </div>

              <p className={styles.summary}>
                Search faster, load ready-made mood packs, and keep your active
                mix, tools, and playback controls close without crowding the main
                workspace.
              </p>

              <div className={styles.utilityActions}>
                <button
                  className={`${styles.utilityButton} ${
                    focusMode ? styles.utilityButtonActive : ''
                  }`}
                  onClick={toggleFocusMode}
                >
                  <MdOutlineCenterFocusStrong />
                  <span>{focusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
                </button>

                <button className={styles.utilityButton} onClick={toggleTheme}>
                  {isDarkTheme ? <IoSunnyOutline /> : <IoMoonSharp />}
                  <span>{isDarkTheme ? 'Day Mode' : 'Night Mode'}</span>
                </button>
              </div>
            </div>

            <div className={styles.packPanel}>
              <div className={styles.panelHeader}>
                <p className={styles.panelEyebrow}>Mood Packs</p>
                <h3 className={styles.panelTitle}>Start with a finished scene</h3>
                <p className={styles.panelDescription}>
                  Load a curated ambience, then fine-tune the layers in your live
                  session.
                </p>
              </div>

              <div className={styles.packGrid}>
                {moodPacks.map(pack => (
                  <button
                    key={pack.id}
                    className={styles.packCard}
                    onClick={() => applyMoodPack(pack)}
                  >
                    <span className={styles.packMood}>{pack.mood}</span>
                    <span className={styles.packHeading}>{pack.title}</span>
                    <span className={styles.packBody}>{pack.description}</span>
                    <span className={styles.packSounds}>
                      {pack.layers.join(' • ')}
                    </span>
                    <span className={styles.packApply}>Load mix</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.workspace}>
            <aside className={styles.sidebar}>
              <div className={styles.panelHeader}>
                <p className={styles.panelEyebrow}>Browse</p>
                <h3 className={styles.panelTitle}>Sound libraries</h3>
                <p className={styles.panelDescription}>
                  Jump between collections without losing the sounds already in
                  your session.
                </p>
              </div>

              <div className={styles.categoryList}>
                {allCategories.map(category => {
                  const selectedInCategory = category.sounds.filter(
                    sound => soundState[sound.id]?.isSelected,
                  ).length;

                  return (
                    <button
                      key={category.id}
                      className={
                        category.id === activeCategory?.id
                          ? `${styles.categoryButton} ${styles.categoryButtonActive}`
                          : styles.categoryButton
                      }
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      <span className={styles.categoryIcon}>{category.icon}</span>

                      <span className={styles.categoryMeta}>
                        <span className={styles.categoryLabel}>
                          {category.title}
                        </span>
                        <span className={styles.categoryCount}>
                          {category.sounds.length} sounds
                        </span>
                      </span>

                      {selectedInCategory > 0 && (
                        <span className={styles.categoryBadge}>
                          {selectedInCategory}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className={styles.sidebarNote}>
                Open the command deck for timers, notes, breathing, presets, and
                extra generators. Use <kbd>Shift + F</kbd> any time to toggle
                focus mode.
              </div>
            </aside>

            <main className={styles.library}>
              <div className={styles.libraryHeaderTop}>
                <div className={styles.panelHeader}>
                  <p className={styles.panelEyebrow}>Library</p>
                  <h3 className={styles.panelTitle}>{activeCategory?.title}</h3>
                  <p className={styles.panelDescription}>
                    Search this collection, filter it down, and reveal controls
                    only when you need them.
                  </p>
                </div>

                <div className={styles.libraryMeta}>
                  <span>{activeCategory?.sounds.length || 0} available</span>
                  <span>{activeCategorySelectedCount} in this library</span>
                  <span>{totalSelected} in current mix</span>
                </div>
              </div>

              <div className={styles.searchRow}>
                <label className={styles.searchField}>
                  <span className={styles.searchFieldIcon}>
                    <BiSearchAlt2 />
                  </span>
                  <input
                    className={styles.searchInput}
                    placeholder={`Search ${activeCategory?.title?.toLowerCase() || 'sounds'}`}
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </label>

                {hasLibraryFilters && (
                  <button className={styles.clearFiltersButton} onClick={clearFilters}>
                    <MdFilterAltOff />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className={styles.filterRow}>
                <button
                  className={`${styles.filterChip} ${
                    libraryFilter === 'all' ? styles.filterChipActive : ''
                  }`}
                  onClick={() => setLibraryFilter('all')}
                >
                  All
                </button>
                <button
                  className={`${styles.filterChip} ${
                    libraryFilter === 'favorites' ? styles.filterChipActive : ''
                  }`}
                  onClick={() => setLibraryFilter('favorites')}
                >
                  Favorites
                </button>
                <button
                  className={`${styles.filterChip} ${
                    libraryFilter === 'selected' ? styles.filterChipActive : ''
                  }`}
                  onClick={() => setLibraryFilter('selected')}
                >
                  Selected
                </button>
              </div>

              {visibleLibrarySounds.length ? (
                <Sounds
                  functional={visibleLibraryFunctional}
                  id={visibleLibraryId}
                  sounds={visibleLibrarySounds}
                />
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>No sounds match this view.</div>
                  <p>
                    Try another search term, switch the filter, or clear the
                    current view to bring the full library back.
                  </p>
                </div>
              )}

              <div aria-hidden="true" className={styles.audioMounts}>
                {mountedPlaybackCategories.map(category => (
                  <Sounds
                    functional
                    id={`${category.id}-playback`}
                    key={`${category.id}-playback`}
                    sounds={category.sounds}
                  />
                ))}
              </div>
            </main>

            <aside className={styles.mixPanel}>
              <div className={styles.panelHeader}>
                <p className={styles.panelEyebrow}>Mix</p>
                <h3 className={styles.panelTitle}>Current session</h3>
                <p className={styles.panelDescription}>
                  Adjust the sounds you have already picked without hunting back
                  through every category.
                </p>
              </div>

              <div className={styles.globalVolume}>
                <div className={styles.globalVolumeHeader}>
                  <span>Global volume</span>
                  <span>{Math.round(globalVolume * 100)}%</span>
                </div>

                <Slider
                  max={100}
                  min={0}
                  value={globalVolume * 100}
                  onChange={value => setGlobalVolume(value / 100)}
                />
              </div>

              {selectedSounds.length ? (
                <div className={styles.mixList}>
                  {selectedSounds.map(sound => (
                    <div className={styles.mixItem} key={sound.id}>
                      <div className={styles.mixItemTop}>
                        <div className={styles.mixIdentity}>
                          <span className={styles.mixItemIcon}>{sound.icon}</span>

                          <div>
                            <div className={styles.mixItemLabel}>{sound.label}</div>
                            <div className={styles.mixItemCategory}>
                              {sound.categoryTitle}
                            </div>
                          </div>
                        </div>

                        <button
                          aria-label={`Remove ${sound.label}`}
                          className={styles.removeButton}
                          onClick={() => {
                            setRate(sound.id, 1);
                            unselect(sound.id);
                          }}
                        >
                          <BiX />
                        </button>
                      </div>

                      <div className={styles.mixControls}>
                        <div className={styles.mixSliderRow}>
                          <span>Vol</span>
                          <Slider
                            max={100}
                            min={0}
                            value={soundState[sound.id].volume * 100}
                            onChange={value => setVolume(sound.id, value / 100)}
                          />
                          <span>{Math.round(soundState[sound.id].volume * 100)}%</span>
                        </div>

                        <div className={styles.mixSliderRow}>
                          <span>Speed</span>
                          <Slider
                            max={150}
                            min={50}
                            step={5}
                            value={soundState[sound.id].rate * 100}
                            onChange={value => setRate(sound.id, value / 100)}
                          />
                          <span>{soundState[sound.id].rate.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>
                    Build your first active session.
                  </div>
                  <p>
                    Select a sound from the library or load a mood pack above.
                    Your live controls will appear here immediately.
                  </p>
                </div>
              )}
            </aside>
          </section>

          <section className={styles.nowPlayingDock}>
            <div className={styles.dockSummary}>
              <span className={styles.dockEyebrow}>Now Playing</span>
              <span className={styles.dockTitle}>
                {totalSelected
                  ? `${totalSelected} layered sound${totalSelected === 1 ? '' : 's'} active`
                  : 'No sounds selected yet'}
              </span>
            </div>

            <div className={styles.dockChips}>
              {activeMixPreview.length ? (
                <>
                  {activeMixPreview.map(sound => (
                    <span className={styles.dockChip} key={sound.id}>
                      <span className={styles.dockChipIcon}>{sound.icon}</span>
                      <span>{sound.label}</span>
                    </span>
                  ))}

                  {hiddenMixCount > 0 && (
                    <span className={styles.dockMore}>+{hiddenMixCount} more</span>
                  )}
                </>
              ) : (
                <span className={styles.dockPlaceholder}>
                  Pick a sound or load a mood pack to begin.
                </span>
              )}
            </div>

            <div className={styles.dockVolume}>
              <span>Master</span>
              <div className={styles.dockSliderWrap}>
                <Slider
                  max={100}
                  min={0}
                  value={globalVolume * 100}
                  onChange={value => setGlobalVolume(value / 100)}
                />
              </div>
              <span>{Math.round(globalVolume * 100)}%</span>
            </div>

            <div className={styles.dockControls}>
              <Buttons />

              <button className={styles.dockControlButton} onClick={toggleMute}>
                {globalVolume === 0 ? <BiVolumeMute /> : <BiVolumeFull />}
                <span>{globalVolume === 0 ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                className={`${styles.dockControlButton} ${
                  focusMode ? styles.dockControlActive : ''
                }`}
                onClick={toggleFocusMode}
              >
                <MdOutlineCenterFocusStrong />
                <span>Focus</span>
              </button>

              <button className={styles.dockControlButton} onClick={toggleTheme}>
                {isDarkTheme ? <IoSunnyOutline /> : <IoMoonSharp />}
                <span>{isDarkTheme ? 'Day' : 'Night'}</span>
              </button>

              <Toolbar />
            </div>
          </section>
        </Container>
        <SharedModal />
      </StoreConsumer>
    </SnackbarProvider>
  );
}
