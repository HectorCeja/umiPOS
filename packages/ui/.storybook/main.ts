import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  viteFinal: (config) => ({
    ...config,
    build: { ...config.build, chunkSizeWarningLimit: 1_500 },
  }),
};

export default config;
