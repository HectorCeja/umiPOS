import type { LivingSceneVariant } from './experience.js';

export interface LivingSceneArtwork {
  id: 'woman-pos' | 'products' | 'inventory' | 'analytics' | 'abstract';
  src: string;
  intensity: number;
  crop: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
}

const womanPos: LivingSceneArtwork = {
  id: 'woman-pos',
  src: '/brand/womanpos.png',
  intensity: 0.44,
  crop: { desktop: '74% 48%', tablet: '70% 50%', mobile: '66% 48%' },
};

const abstractArtwork: LivingSceneArtwork = {
  id: 'abstract',
  src: 'abstract',
  intensity: 0.1,
  crop: { desktop: '78% 48%', tablet: '74% 50%', mobile: '68% 50%' },
};

export const authenticatedLivingSceneVariants = [
  'home',
  'dashboard',
  'catalog',
  'products',
  'inventory',
  'sales',
  'cash',
  'reports',
  'team',
  'profile',
  'settings',
  'command',
  'focused',
  'minimal',
] as const satisfies readonly LivingSceneVariant[];

export const livingSceneArtworkRegistry: Readonly<
  Partial<Record<LivingSceneVariant, LivingSceneArtwork>>
> = {
  home: womanPos,
  sales: { ...womanPos, crop: { desktop: '82% 52%', tablet: '76% 50%', mobile: '70% 50%' } },
  cash: { ...womanPos, crop: { desktop: '68% 54%', tablet: '66% 52%', mobile: '62% 50%' } },
  products: {
    id: 'products',
    src: '/brand/products.jpeg',
    intensity: 0.36,
    crop: { desktop: '74% 48%', tablet: '70% 50%', mobile: '66% 48%' },
  },
  catalog: {
    id: 'products',
    src: '/brand/products.jpeg',
    intensity: 0.36,
    crop: { desktop: '74% 48%', tablet: '70% 50%', mobile: '66% 48%' },
  },
  inventory: {
    id: 'inventory',
    src: '/brand/inventory.jpeg',
    intensity: 0.38,
    crop: { desktop: '78% 50%', tablet: '72% 50%', mobile: '68% 48%' },
  },
  reports: {
    id: 'analytics',
    src: '/brand/analytics.jpeg',
    intensity: 0.42,
    crop: { desktop: '72% 46%', tablet: '68% 48%', mobile: '64% 46%' },
  },
  dashboard: abstractArtwork,
  team: abstractArtwork,
  profile: abstractArtwork,
  settings: abstractArtwork,
  command: abstractArtwork,
  focused: abstractArtwork,
  minimal: abstractArtwork,
};

export const livingSceneArtworkSources = [
  '/brand/womanpos.png',
  '/brand/products.jpeg',
  '/brand/inventory.jpeg',
  '/brand/analytics.jpeg',
] as const;

export function artworkForLivingScene(variant: LivingSceneVariant) {
  return livingSceneArtworkRegistry[variant] ?? null;
}

export function artworkForSource(src: string) {
  return Object.values(livingSceneArtworkRegistry).find((artwork) => artwork.src === src) ?? null;
}

export function artworkBackground(artwork: LivingSceneArtwork) {
  return artwork.id === 'abstract'
    ? 'radial-gradient(ellipse 62% 72% at 78% 46%, rgb(72 92 174 / 42%), transparent 72%)'
    : `url("${artwork.src}")`;
}

export function livingSceneArtworkCoverage() {
  return authenticatedLivingSceneVariants.map((variant) => ({
    variant,
    artwork: livingSceneArtworkRegistry[variant] ?? null,
  }));
}

const preloadedArtwork = new Set<string>();

export function preloadLivingSceneArtwork() {
  if (typeof window === 'undefined') return;
  for (const src of livingSceneArtworkSources) {
    if (preloadedArtwork.has(src)) continue;
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    preloadedArtwork.add(src);
  }
}
