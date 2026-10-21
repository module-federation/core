import { label } from './helper.js';

export function init() {}

export function get(request) {
  return Promise.resolve(() => `${label} ${request}`);
}
