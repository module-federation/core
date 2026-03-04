import { MESSAGE_MF_DIAGNOSTIC } from './messages';

if (window.moduleHandler) {
  window.removeEventListener('message', window.moduleHandler);
} else {
  window.moduleHandler = (event) => {
    const { origin, data } = event;
    if (data.moduleInfo) {
      chrome.runtime
        .sendMessage({
          origin,
          data: {
            moduleInfo: data.moduleInfo,
            updateModule: data.updateModule,
            share: data.share,
          },
        })
        .catch(() => {
          return false;
        });
    }
    if (data.mfDiagnostic) {
      chrome.runtime
        .sendMessage({
          type: MESSAGE_MF_DIAGNOSTIC,
          origin,
          data: { mfDiagnostic: data.mfDiagnostic },
        })
        .catch(() => {
          return false;
        });
    }
  };
}
window.addEventListener('message', window.moduleHandler);
