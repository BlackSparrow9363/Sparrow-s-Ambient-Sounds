import { useCallback, useEffect, useRef } from 'react';

import { BrowserDetect } from '@/helpers/browser-detect';

import { useSoundStore } from '@/stores/sound';

import { useSSR } from '@/hooks/use-ssr';

const metadata: MediaMetadataInit = {
  artist: 'Sparrow Sound Desk',
  title: 'Ambient Sounds for Focus and Calm',
};

export function MediaSessionTrack() {
  const { isBrowser } = useSSR();
  const isPlaying = useSoundStore(state => state.isPlaying);
  const play = useSoundStore(state => state.play);
  const pause = useSoundStore(state => state.pause);
  const masterAudioSoundRef = useRef<HTMLAudioElement>(null);
  const artworkURL = '/logo.svg';

  useEffect(() => {
    if (!isBrowser || !isPlaying) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      ...metadata,
      artwork: [
        {
          sizes: '128x128',
          src: artworkURL,
          type: 'image/svg+xml',
        },
      ],
    });
  }, [artworkURL, isBrowser, isPlaying]);

  const startMasterAudio = useCallback(async () => {
    if (!masterAudioSoundRef.current) return;
    if (!masterAudioSoundRef.current.paused) return;

    try {
      await masterAudioSoundRef.current.play();

      navigator.mediaSession.playbackState = 'playing';
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
    } catch {
      // Do nothing
    }
  }, [pause, play]);

  const stopMasterAudio = useCallback(() => {
    if (!masterAudioSoundRef.current) return;
    /**
     * Otherwise in Safari we cannot play the audio again
     * through the media session controls
     */
    if (BrowserDetect.isSafari()) {
      masterAudioSoundRef.current.load();
    } else {
      masterAudioSoundRef.current.pause();
    }
    navigator.mediaSession.playbackState = 'paused';
  }, []);

  useEffect(() => {
    if (!masterAudioSoundRef.current) return;

    if (isPlaying) {
      startMasterAudio();
    } else {
      stopMasterAudio();
    }
  }, [isPlaying, startMasterAudio, stopMasterAudio]);

  useEffect(() => {
    const masterAudioSound = masterAudioSoundRef.current;

    return () => {
      masterAudioSound?.pause();

      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.playbackState = 'none';
    };
  }, []);

  return (
    <audio
      id="media-session-track"
      loop
      ref={masterAudioSoundRef}
      src="/sounds/silence.wav"
    />
  );
}
