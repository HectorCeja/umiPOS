import { readFileSync } from 'node:fs';

import type { AuthenticationConfiguration } from '@nexo/config';
import { Inject, Injectable } from '@nestjs/common';

import {
  AUTHENTICATION_CONFIGURATION,
  type CompromisedPasswordPort,
} from '../application/authentication.ports.js';

@Injectable()
export class FilePasswordBlocklist implements CompromisedPasswordPort {
  private readonly entries: ReadonlySet<string>;

  constructor(@Inject(AUTHENTICATION_CONFIGURATION) configuration: AuthenticationConfiguration) {
    const values = readFileSync(configuration.passwordBlocklistFile, 'utf8')
      .split(/\r?\n/u)
      .map((value) => value.trim().normalize('NFKC').toLocaleLowerCase('en-US'))
      .filter(Boolean);
    if (values.length === 0) throw new Error('Password blocklist must not be empty');
    this.entries = new Set(values);
  }

  isCompromised(password: string): boolean {
    return this.entries.has(password.normalize('NFKC').toLocaleLowerCase('en-US'));
  }
}
