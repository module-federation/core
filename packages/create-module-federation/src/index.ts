import { create } from './create';

interface Template {
  template: string;
  tools?: Record<string, string>;
}

export const TEMPLATES = [
  'provider-modern',
  'consumer-modern',
  'provider-rsbuild',
  'consumer-rsbuild',
  'rslib',
  'rslib-storybook',
];

create({
  name: 'Module Federation',
  templates: TEMPLATES,
});
