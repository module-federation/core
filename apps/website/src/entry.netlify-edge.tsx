/*
 * WHAT IS THIS FILE?
 *
 * It's the  entry point for netlify-edge when building for production.
 *
 * Learn more about the cloudflare integration here:
 * - https://qwik.builder.io/integrations/deployments/netlify-edge/
 *
 */
import {
  createQwikCity,
  type PlatformNetlify,
} from '@builder.io/qwik-city/middleware/netlify-edge';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface QwikCityPlatform extends PlatformNetlify {}
}

export default createQwikCity({ render, qwikCityPlan, manifest });
