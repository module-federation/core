import { loadScript, RemoteError } from '@module-federation/utilities';
import { resolveModuleContainer } from './container';

const delegate = new Promise((resolve, reject) => {
  const federatedRemoteUrl: string = new URLSearchParams(__resourceQuery).get(
    'remote'
  ) as string;

  const [name, url] = federatedRemoteUrl.split('@');

  loadScript({
    global: name,
    url,
  })
    .then(resolveModuleContainer)
    .catch((err: RemoteError) => reject(err));
});

module.exports = delegate;
