import os from 'os';
function getNetworkHosts(family) {
    const interfaces = os.networkInterfaces();
    const hosts = [];
    Object.keys(interfaces).forEach((key)=>{
        var _interfaces_key;
        (_interfaces_key = interfaces[key]) == null ? void 0 : _interfaces_key.filter((networkInterface)=>{
            switch(networkInterface.family){
                case 'IPv6':
                    return family === 'IPv6' && networkInterface.scopeid === 0 && networkInterface.address !== '::1';
                case 'IPv4':
                    return family === 'IPv4' && networkInterface.address !== '127.0.0.1';
                default:
                    return false;
            }
        }).forEach((networkInterface)=>{
            if (networkInterface.address) {
                hosts.push(networkInterface.address);
            }
        });
    });
    return hosts;
}
export function getNetworkHost(family) {
    const hosts = getNetworkHosts(family);
    return hosts[0] ?? null;
}

//# sourceMappingURL=get-network-host.js.map