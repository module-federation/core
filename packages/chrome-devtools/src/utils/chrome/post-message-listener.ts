import { sanitizePostMessagePayload } from './safe-post-message';
import {
  MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT,
  OBSERVABILITY_DEVTOOLS_SOURCE,
} from './messages';

if (window.moduleHandler) {
  window.removeEventListener('message', window.moduleHandler);
} else {
  window.moduleHandler = (event) => {
    const { origin, data } = event;
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

    if (!data.moduleInfo) {
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
