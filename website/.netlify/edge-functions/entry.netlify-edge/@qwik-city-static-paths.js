const staticPaths = new Set(["/_headers","/bundlers/esbuild.svg","/bundlers/rollup.svg","/bundlers/rspack.svg","/bundlers/vite.svg","/bundlers/webpack.svg","/companies/adidas.svg","/companies/bestbuy.svg","/companies/box.svg","/companies/business_insider.svg","/companies/cloudflare.svg","/companies/epic_games.svg","/companies/katman.svg","/companies/lululemon.svg","/companies/openclassrooms.svg","/companies/pandadoc.svg","/companies/shopify.svg","/companies/tiktok.svg","/companies/zoominfo.svg","/default-og.png","/favicon.svg","/fonts/AvenirNextLTPro-Bold.otf","/fonts/AvenirNextLTPro-BoldCn.otf","/fonts/AvenirNextLTPro-BoldCnIt.otf","/fonts/AvenirNextLTPro-BoldIt.otf","/fonts/AvenirNextLTPro-Cn.otf","/fonts/AvenirNextLTPro-CnIt.otf","/fonts/AvenirNextLTPro-Demi.otf","/fonts/AvenirNextLTPro-DemiCn.otf","/fonts/AvenirNextLTPro-DemiCnIt.otf","/fonts/AvenirNextLTPro-DemiIt.otf","/fonts/AvenirNextLTPro-Heavy.otf","/fonts/AvenirNextLTPro-HeavyCn.otf","/fonts/AvenirNextLTPro-HeavyCnIt.otf","/fonts/AvenirNextLTPro-HeavyIt.otf","/fonts/AvenirNextLTPro-It.otf","/fonts/AvenirNextLTPro-Medium.otf","/fonts/AvenirNextLTPro-MediumCn.otf","/fonts/AvenirNextLTPro-MediumCnIt.otf","/fonts/AvenirNextLTPro-MediumIt.otf","/fonts/AvenirNextLTPro-Regular.otf","/fonts/AvenirNextLTPro-UltLt.otf","/fonts/AvenirNextLTPro-UltLtCn.otf","/fonts/AvenirNextLTPro-UltLtCnIt.otf","/fonts/AvenirNextLTPro-UltLtIt.otf","/forms.html","/icons/discord.svg","/icons/github.svg","/illustrations/community-content.svg","/illustrations/conference-talks.svg","/illustrations/implementing-module-federation.svg","/illustrations/module-federation-courses.svg","/illustrations/pratical-module-federation.svg","/manifest.json","/module-federation-logo.svg","/pattern_9.png","/photos/zack_jackson.png","/q-manifest.json","/robots.txt","/service-worker.js","/showcase/adidas.png","/showcase/bestbuy.png","/showcase/business_insider.png","/showcase/epic_games.png","/showcase/lululemon.png","/showcase/panda_doc.png","/showcase/shopify_partners.png","/showcase/tiktok.png","/showcase/zoominfo.png","/sitemap.xml","/valor.svg","/~partytown/debug/partytown-atomics.js","/~partytown/debug/partytown-media.js","/~partytown/debug/partytown-sandbox-sw.js","/~partytown/debug/partytown-sw.js","/~partytown/debug/partytown-ww-atomics.js","/~partytown/debug/partytown-ww-sw.js","/~partytown/debug/partytown.js","/~partytown/partytown-atomics.js","/~partytown/partytown-media.js","/~partytown/partytown-sw.js","/~partytown/partytown.js"]);
function isStaticPath(method, url) {
  if (method.toUpperCase() !== 'GET') {
    return false;
  }
  const p = url.pathname;
  if (p.startsWith("/build/")) {
    return true;
  }
  if (p.startsWith("/assets/")) {
    return true;
  }
  if (staticPaths.has(p)) {
    return true;
  }
  if (p.endsWith('/q-data.json')) {
    const pWithoutQdata = p.replace(/\/q-data.json$/, '');
    if (staticPaths.has(pWithoutQdata + '/')) {
      return true;
    }
    if (staticPaths.has(pWithoutQdata)) {
      return true;
    }
  }
  return false;
}
export { isStaticPath };