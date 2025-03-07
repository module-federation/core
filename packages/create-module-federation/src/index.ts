#!/usr/bin/env node
import { create } from './create';

interface Template {
  template: string;
  tools?: Record<string, string>;
}

export const TEMPLATES = [
  'provider-modern',
  'provider-rsbuild',
  'rslib',
  'rslib-storybook',
];

create({
  name: 'Module Federation',
  templates: TEMPLATES,
});
