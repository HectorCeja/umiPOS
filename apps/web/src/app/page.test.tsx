import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HomePage from './page.js';

describe('HomePage', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('presents session restoration before the business home', () => {
    document.cookie = 'nexo_csrf=test-csrf; path=/';
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
    render(<HomePage />);
    expect(screen.getByText('Preparando tu espacio de trabajo…')).toBeInTheDocument();
  });
});
