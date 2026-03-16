export type MoodPack = {
  categoryId: string;
  description: string;
  id: string;
  layers: Array<string>;
  mood: string;
  sounds: Record<string, number>;
  title: string;
};

export const moodPacks: Array<MoodPack> = [
  {
    categoryId: 'places',
    description:
      'A balanced cafe-and-rain blend for writing, planning, and deep work.',
    id: 'deep-focus',
    layers: ['Cafe', 'Library', 'Light Rain', 'Wind'],
    mood: 'Focus',
    sounds: {
      cafe: 0.42,
      library: 0.28,
      'light-rain': 0.34,
      wind: 0.16,
    },
    title: 'Deep Focus',
  },
  {
    categoryId: 'rain',
    description:
      'Soft rain layers with low thunder for winding down or falling asleep.',
    id: 'rain-sleep',
    layers: ['Rain on Window', 'Heavy Rain', 'Thunder', 'Campfire'],
    mood: 'Sleep',
    sounds: {
      'rain-on-window': 0.48,
      'heavy-rain': 0.4,
      thunder: 0.16,
      campfire: 0.12,
    },
    title: 'Rain Sleep',
  },
  {
    categoryId: 'nature',
    description:
      'A quieter woodland mix with flowing water and soft morning details.',
    id: 'forest-calm',
    layers: ['River', 'Wind in Trees', 'Birds', 'Droplets'],
    mood: 'Calm',
    sounds: {
      river: 0.44,
      'wind-in-trees': 0.34,
      birds: 0.24,
      droplets: 0.18,
    },
    title: 'Forest Calm',
  },
  {
    categoryId: 'places',
    description:
      'Warm indoor textures for late-night reading, sketching, or quiet rest.',
    id: 'cozy-night',
    layers: ['Campfire', 'Rain on Tent', 'Night Village', 'Owl'],
    mood: 'Cozy',
    sounds: {
      campfire: 0.44,
      'rain-on-tent': 0.32,
      'night-village': 0.22,
      owl: 0.16,
    },
    title: 'Cozy Night',
  },
  {
    categoryId: 'urban',
    description:
      'A gentler city blend for design sessions, reading, and creative flow.',
    id: 'city-flow',
    layers: ['Cafe', 'Road', 'Subway Station', 'Crowd'],
    mood: 'Flow',
    sounds: {
      cafe: 0.36,
      road: 0.18,
      'subway-station': 0.24,
      crowd: 0.12,
    },
    title: 'City Flow',
  },
];
