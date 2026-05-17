import { ModuleFederation } from '@module-federation/runtime-core';

const statusEl = document.querySelector('[data-test="status"]');
const messageEl = document.querySelector('[data-test="remote-message"]');

const setStatus = (message: string) => {
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const setMessage = (message: string) => {
  if (messageEl) {
    messageEl.textContent = message;
  }
};

const federation = new ModuleFederation({
  name: 'import-map-host',
  remotes: [
    {
      name: 'import_map_remote',
      entry: 'import_map_remote',
      type: 'module',
      entryFormat: 'importmap',
    },
  ],
  shared: {},
});

const loadRemoteMessage = async () => {
  try {
    setStatus('Loading remote...');
    const remoteModule = await federation.loadRemote<{
      default?: () => string;
    }>('import_map_remote/hello');

    const message =
      remoteModule?.default?.() ?? 'Remote module did not return a message.';
    setMessage(message);
    setStatus('Loaded');
  } catch (error) {
    setStatus('Failed');
    setMessage(`Error loading remote: ${String(error)}`);
  }
};

void loadRemoteMessage();
