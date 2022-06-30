const buildClientRemotes = (federationPluginOptions, webpack) => {
  const clientRemotes = Object.entries(
    federationPluginOptions.remotes || {}
  ).reduce((acc, [name, config]) => {
    const hasMiddleware = config.startsWith("middleware ");
    // generate two flavours of remote modules
    // one for build time, federation to reference
    if (!acc.buildTime) {
      acc.buildTime = {};
    }
    // another for runtime and dynamic remotes
    if (!acc.runtime) {
      acc.runtime = {};
    }
    let middleware;
    if (hasMiddleware) {
      middleware = config.split("middleware ")[1];
    } else {
      middleware = `Promise.resolve(${JSON.stringify(config)})`;
    }
    // TODO: get args from function caller scope, dont use arrow func

    const template = `(remotesConfig) => new Promise((res,rej)=>{
           const scriptUrl = remotesConfig.split("@")[1]
           const moduleName = remotesConfig.split("@")[0]
       
          // if webpack require does not exist, create it from module args
          var ${webpack.RuntimeGlobals.require} = ${
      webpack.RuntimeGlobals.require
    } ? ${
      webpack.RuntimeGlobals.require
    } : typeof arguments !== 'undefined' && arguments[2]
    // if using modern output, then there are no arguments on the parent function scope, thus we need to get it via a window global. 
          var shareScope = ${webpack.RuntimeGlobals.require} ? ${
      webpack.RuntimeGlobals.shareScopeMap
    } : window.__webpack_share_scopes__
          var existingScript = document.querySelector('[data-webpack=${JSON.stringify(
            name
          )}]') 
          
          var d = document, script = d.createElement('script');
          script.type = 'text/javascript';
          script.setAttribute("data-webpack", ${JSON.stringify(name)});
          script.async = true;
          script.onerror = function(error){rej(error)};
          script.onload = function(){
          if(!window[moduleName].__initialized) {
            Promise.resolve(window[moduleName].init(shareScope.default)).then(function(){
              window[moduleName].__initialized = true;
              res(window[moduleName]);
            });
          } else {
            window[moduleName].__initialized = true;
            res(window[moduleName]);
          }
    };
    let remoteUrl = scriptUrl;
    try {
      const remote = new URL(remoteUrl);
      remote.searchParams.set("cbust", Date.now());
      remoteUrl = remote.href
    } catch (e) {
      console.log("Module Federation: remote",moduleName,"url isn't valid url, falling back",e);
    }
    

    script.src = remoteUrl;
 
    if(existingScript) {
      if(window[moduleName]) {
        script.onload()
      } else {
        existingScript.onload = script.onload
        existingScript.onerror = script.onerror
      }
    } else {
      d.getElementsByTagName('head')[0].appendChild(script);
    }
          })`;

    acc.runtime[name] = `()=> ${middleware}.then((remoteConfig)=>{
        const loadTemplate = ${template};
        window.remoteLoader = window.remoteLoader || {}
        if(window.remoteLoader[${JSON.stringify(name)}]) {
          return window.remoteLoader[${JSON.stringify(name)}]
        }
        window.remoteLoader[${JSON.stringify(name)}] = loadTemplate(remoteConfig)
        
        return window.remoteLoader[${JSON.stringify(name)}]

    })`;
    acc.buildTime[name] = `promise ${middleware}.then((remoteConfig)=>{
    const loadTemplate = ${template};

    window.remoteLoader = window.remoteLoader || {}
    if(window.remoteLoader[${JSON.stringify(name)}]) {
          return window.remoteLoader[${JSON.stringify(name)}]
    }
    window.remoteLoader[${JSON.stringify(name)}] = loadTemplate(remoteConfig)
        
    return window.remoteLoader[${JSON.stringify(name)}]
    })`;

    return acc;
  }, {});
  return clientRemotes;
};

module.exports = buildClientRemotes;
