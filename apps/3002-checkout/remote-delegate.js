import { importDelegatedModule } from '@module-federation/utilities';

// Delegates are currently not used in this example, but are left here for testing.
module.exports = new Promise((resolve, reject) => {
  console.log('Delegate being called for', __resourceQuery);
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url,
  })
    .then(async (remote) => {
      resolve(remote)
    })
    .catch((err) => reject(err));
});
