import type { Hono } from 'hono';
import type { AppEnv } from '@/http/env';

export type FrontendAdapter = {
  id: string;
  register: (app: Hono<AppEnv>) => void;
};
