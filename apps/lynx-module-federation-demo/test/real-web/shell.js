import '@lynx-js/web-core/client';

const state = {
  errors: [],
  timings: [],
};

globalThis.__LYNX_WEB_E2E__ = state;

await customElements.whenDefined('lynx-view');

const lynxView = document.createElement('lynx-view');
lynxView.id = 'orbit-lynx-view';
lynxView.initData = { e2e: true, surface: 'lynx-web' };
lynxView.globalProps = { e2e: true, platform: 'web' };
lynxView.setAttribute('height', '100%');
lynxView.setAttribute('width', '100%');
lynxView.addEventListener('error', (event) => {
  state.errors.push(String(event.detail?.message ?? event.detail ?? event));
});
lynxView.addEventListener('timing', (event) => {
  state.timings.push(event.detail);
});

document.body.append(lynxView);
lynxView.setAttribute('url', '/dist/host-web/main.web.bundle');
