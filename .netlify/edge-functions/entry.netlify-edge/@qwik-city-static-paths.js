const staticPaths = new Set(["/_headers","/bundlers/esbuild.svg","/bundlers/rollup.svg","/bundlers/rspack.svg","/bundlers/vite.svg","/bundlers/webpack.svg","/companies/adidas.svg","/companies/bestbuy.svg","/companies/box.svg","/companies/business_insider.svg","/companies/cloudflare.svg","/companies/epic_games.svg","/companies/katman.svg","/companies/lululemon.svg","/companies/openclassrooms.svg","/companies/pandadoc.svg","/companies/shopify.svg","/companies/tiktok.svg","/companies/zoominfo.svg","/favicon.svg","/fonts/AvenirNextLTPro-Bold.woff","/fonts/AvenirNextLTPro-BoldCn.woff","/fonts/AvenirNextLTPro-BoldCnIt.woff","/fonts/AvenirNextLTPro-Cn.woff","/fonts/AvenirNextLTPro-CnIt.woff","/fonts/AvenirNextLTPro-Demi.woff","/fonts/AvenirNextLTPro-DemiCn.woff","/fonts/AvenirNextLTPro-DemiCnIt.woff","/fonts/AvenirNextLTPro-DemiIt.woff","/fonts/AvenirNextLTPro-Heavy.woff","/fonts/AvenirNextLTPro-HeavyCn.woff","/fonts/AvenirNextLTPro-HeavyCnIt.woff","/fonts/AvenirNextLTPro-HeavyIt.woff","/fonts/AvenirNextLTPro-It.woff","/fonts/AvenirNextLTPro-MediumCn.woff","/fonts/AvenirNextLTPro-MediumCnIt.woff","/fonts/AvenirNextLTPro-MediumIt.woff","/fonts/AvenirNextLTPro-Regular.woff","/fonts/AvenirNextLTPro-UltLt.woff","/fonts/AvenirNextLTPro-UltLtCn.woff","/fonts/AvenirNextLTPro-UltLtCnIt.woff","/fonts/AvenirNextLTPro-UltLtIt.woff","/forms.html","/icons/discord.svg","/icons/github.svg","/illustrations/community-content.svg","/illustrations/conference-talks.svg","/illustrations/implementing-module-federation.svg","/illustrations/module-federation-courses.svg","/illustrations/pratical-module-federation.svg","/manifest.json","/module-federation-logo.svg","/pattern.png","/pattern_10.svg","/pattern_2.png","/pattern_3.png","/pattern_4.png","/pattern_5.png","/pattern_6.png","/pattern_7.png","/pattern_8.png","/pattern_9.png","/photos/zack_jackson.png","/q-manifest.json","/robots.txt","/service-worker.js","/showcase/adidas.png","/showcase/bestbuy.png","/showcase/business_insider.png","/showcase/epic_games.png","/showcase/lululemon.png","/showcase/panda_doc.png","/showcase/shopify_partners.png","/showcase/tiktok.png","/showcase/zoominfo.png","/sitemap.xml"]);
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