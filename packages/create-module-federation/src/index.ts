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

  // other
  'create-zephyr',
];

create({
  name: 'Module Federation',
  templates: TEMPLATES,
});
