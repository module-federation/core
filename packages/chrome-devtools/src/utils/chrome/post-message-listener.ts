import { sanitizePostMessagePayload } from './safe-post-message';
import {
  MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT,
  OBSERVABILITY_DEVTOOLS_SOURCE,
} from './messages';

const isModuleInfoPayload = (value: unknown) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getMessageData = (data: unknown) =>
  Boolean(data) && typeof data === 'object'
    ? (data as Record<string, unknown>)
    : {};

if (window.moduleHandler) {
  window.removeEventListener('message', window.moduleHandler);
} else {
  window.moduleHandler = (event) => {
    const { origin } = event;
    const data = getMessageData(event.data);
    if (data?.source === OBSERVABILITY_DEVTOOLS_SOURCE) {
      chrome.runtime
        .sendMessage({
          type: MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT,
          origin,
          data: sanitizePostMessagePayload(data),
        })
        .catch(() => {
          return false;
        });
      return;
    }

    if (!isModuleInfoPayload(data.moduleInfo)) {
      return;
    }

    chrome.runtime
      .sendMessage({
        origin,
        data: sanitizePostMessagePayload({
          moduleInfo: data.moduleInfo,
          updateModule: data.updateModule,
          share: data.share,
        }),
      })
      .catch(() => {
        return false;
      });
  };
}
window.addEventListener('message', window.moduleHandler);
