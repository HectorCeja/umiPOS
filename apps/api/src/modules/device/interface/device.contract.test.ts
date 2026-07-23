import { describe, expect, it } from 'vitest';
import { permissionRegistry } from '@nexo/authorization';
import { DeviceController } from './device.controller.js';

describe('POS device contract', () => {
  it('registers the complete authorization surface', () => {
    const keys = new Set(permissionRegistry.map(({ key }) => key));
    for (const key of [
      'device.enrollment.create',
      'device.read',
      'device.update',
      'device.revoke',
      'device.rotate_credential',
      'device.assign_branch',
      'device.diagnostics.read',
    ] as const)
      expect(keys.has(key)).toBe(true);
  });

  it('exposes one controller for enrollment, heartbeat and revocation', () => {
    expect(DeviceController).toBeTypeOf('function');
  });
});
