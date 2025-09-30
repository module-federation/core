import http from 'http';
export const getFreePort = async ()=>{
    return new Promise((resolve, reject)=>{
        const server = http.createServer(()=>{});
        server.listen(0, ()=>{
            const address = server.address();
            server.close();
            if (address && typeof address === 'object') {
                resolve(address.port);
            } else {
                reject(Object.defineProperty(new Error('invalid address from server: ' + (address == null ? void 0 : address.toString())), "__NEXT_ERROR_CODE", {
                    value: "E327",
                    enumerable: false,
                    configurable: true
                }));
            }
        });
    });
};

//# sourceMappingURL=worker-utils.js.map