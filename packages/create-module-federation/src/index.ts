#!/usr/bin/env node
import { create } from './create';

interface Template {
  template: string;
  tools?: Record<string, string>;
}

export const TEMPLATES = [
  // Standard templates
  'provider-modern',
  'consumer-modern',
  'provider-rsbuild',
  'consumer-rsbuild',
  'rslib',
  'rslib-storybook',

  // Zephyr integration templates
  'zephyr-webpack-provider',
  'zephyr-webpack-consumer',
  'zephyr-rspack-provider',
  'zephyr-rspack-consumer',
  'zephyr-vite-provider',
  'zephyr-vite-consumer',
];

create({
  name: 'Module Federation',
  templates: TEMPLATES,
});
