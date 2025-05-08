import('remoteApp/utils')
  .then((utils) => console.log('Loaded remote utils:', utils))
  .catch((err) => console.error('Error loading remote:', err));
console.log('Host application started');
