import { renderToString } from '@vue/server-renderer';
import type { BridgeVueServerRenderer } from './provider';

export const renderBridgeVueToString: BridgeVueServerRenderer = (
  app,
  context,
) => renderToString(app, context);
