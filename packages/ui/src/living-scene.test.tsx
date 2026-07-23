import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LivingScene } from './experience.js';
import {
  authenticatedLivingSceneVariants,
  livingSceneArtworkCoverage,
} from './artwork-registry.js';

describe('LivingScene', () => {
  it('separates the reusable seven-layer environment from product content', () => {
    const { container } = render(
      <LivingScene image="/scene.webp">
        <h1>Contenido NEXO</h1>
      </LivingScene>,
    );
    expect(screen.getByRole('heading', { name: 'Contenido NEXO' })).toBeInTheDocument();
    expect(container.querySelectorAll('.nexo-living-scene__blob')).toHaveLength(4);
    expect(container.querySelector('.nexo-living-scene__photo')).toBeInTheDocument();
    expect(container.querySelector('.nexo-living-scene__halos')).toBeInTheDocument();
    expect(container.querySelector('.nexo-living-scene__light-leaks')).toBeInTheDocument();
    expect(container.querySelector('.nexo-living-scene__particles')).toBeInTheDocument();
    expect(container.querySelector('.nexo-living-scene__noise')).toBeInTheDocument();
    expect(container.querySelector('.nexo-living-scene__overlay')).toBeInTheDocument();
    expect(container.querySelectorAll('.nexo-living-scene__particles i')).toHaveLength(14);
  });

  it('supports deterministic and static quality without ambient particles', () => {
    const { container } = render(
      <LivingScene variant="home" quality="static" deterministic>
        <p>Home estable</p>
      </LivingScene>,
    );
    const scene = container.querySelector('.nexo-living-scene');
    expect(scene).toHaveAttribute('data-deterministic', 'true');
    expect(scene).toHaveAttribute('data-scene-variant', 'home');
    expect(scene).toHaveClass('is-static');
    expect(container.querySelectorAll('.nexo-living-scene__particles i')).toHaveLength(0);
  });

  it('mounts one authenticated artwork layer and freezes it in deterministic mode', () => {
    const { container } = render(
      <LivingScene
        variant="sales"
        authenticatedArtwork="/brand/atelier.webp"
        artworkIntensity={0.2}
        enablePointerParallax
        deterministic
      >
        <p>Ventas</p>
      </LivingScene>,
    );
    expect(container.querySelectorAll('.nexo-living-scene__authenticated-artwork')).toHaveLength(1);
    expect(container.querySelectorAll('.nexo-living-scene__artwork-trails')).toHaveLength(1);
    expect(container.querySelector('.nexo-living-scene')).toHaveClass('is-static');
  });

  it('registers artwork for every authenticated scene variant', () => {
    const coverage = livingSceneArtworkCoverage();
    expect(coverage).toHaveLength(authenticatedLivingSceneVariants.length);
    expect(coverage.every(({ artwork }) => artwork !== null)).toBe(true);
    expect(coverage.find(({ variant }) => variant === 'team')?.artwork?.id).toBe('abstract');
    expect(coverage.find(({ variant }) => variant === 'settings')?.artwork?.id).toBe('abstract');
    expect(coverage.find(({ variant }) => variant === 'minimal')?.artwork?.id).toBe('abstract');
  });

  it('mounts the abstract artwork pipeline for support variants', () => {
    const { container } = render(
      <LivingScene variant="minimal" deterministic>
        <p>Ayuda</p>
      </LivingScene>,
    );
    expect(container.querySelector('.nexo-living-scene')).toHaveAttribute(
      'data-artwork-id',
      'abstract',
    );
    expect(container.querySelectorAll('.nexo-living-scene__authenticated-artwork')).toHaveLength(1);
    expect(container.querySelectorAll('.nexo-living-scene__artwork-trails')).toHaveLength(1);
  });
});
