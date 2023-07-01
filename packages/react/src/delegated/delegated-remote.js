const { importDelegatedModule} = require('@module-federation/utilities');

module.exports = new Promise ((resolve, reject) => {
    const currentRequest = new URLSearchParams (__resourceQuery).get('remote');
    const [global, url] = currentRequest.split('@');
    
    importDelegatedModule({ global, url })
        .then(remote => {
            resolve(remote);
        })
        .catch(err => {
            reject(err);
        });
});