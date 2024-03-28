if (window.moduleHandler) {
  window.removeEventListener('message', window.moduleHandler);
} else {
  window.moduleHandler = (event) => {
    const { origin, data } = event;
    if (!data.moduleInfo) {
      return;
    }

    chrome.runtime
      .sendMessage({
        origin,
        data: {
          moduleInfo: data.moduleInfo,
          updateModule: data.updateModule,
        },
      })
      .catch(() => {
        return false;
      });
  };
}
window.addEventListener('message', window.moduleHandler);
