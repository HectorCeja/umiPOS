import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FoundationStatus } from './foundation-status.js';

const meta = {
  title: 'Foundation/Status',
  component: FoundationStatus,
  args: { label: 'Foundation ready' },
  tags: ['autodocs'],
} satisfies Meta<typeof FoundationStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
