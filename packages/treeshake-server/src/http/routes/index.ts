import { Hono } from 'hono';
import { buildRoute } from './build';
import { maintenanceRoute } from './maintenance';

export const routes = new Hono();

routes.route('/build', buildRoute);
routes.route('/clean-cache', maintenanceRoute);
