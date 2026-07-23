import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FoundationStatus } from './foundation-status.js';

describe('FoundationStatus', () => {
  it('exposes its status with native semantics', () => {
    render(<FoundationStatus label="Ready" />);
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
  });
});
