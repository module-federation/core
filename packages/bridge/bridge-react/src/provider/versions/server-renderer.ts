import { renderToString } from 'react-dom/server';

export function renderBridgeReactToString(
  element: React.ReactElement,
  options: { identifierPrefix: string },
) {
  return renderToString(element, options);
}
