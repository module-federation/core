import { importDelegatedModule } from '@module-federation/utilities';

module.exports = new Promise(async (resolve, reject) => {
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const [global, url] = currentRequest.split('@');

  const container = await importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    resolve(container);
});
