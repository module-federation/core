import { importDelegatedModule } from '@module-federation/utilities'
import { createDynamicFederatedPage } from '@module-federation/nextjs-mf/utils'

function trimSlashes(str: string) {
  // Replace slashes at the start and end of the string with an empty string
  return str.replace(/^\/+|\/+$/g, '');
}

// example of pathResolver:
// path: '/shop/catalogue'
// should show: apps/3001-shop/pages/shop/catalogue.tsx
// remoteContainer: 'shop'
// because we have 'exposePages: true' in next.config.js we need to add './pages' to the module path
// modulePath: './pages/shop/catalogue'
function customPathResolver(path: string) {
  const trimmedPath = trimSlashes(path);
  const slashIndex = trimmedPath.indexOf('/');
  const remoteContainer =  slashIndex > -1 ? trimmedPath.substring(0, slashIndex) : trimmedPath;
  const modulePath = slashIndex > -1 ? trimmedPath : `${remoteContainer}/index`;

  return {
    remoteContainer,
    modulePath: `./pages/${modulePath}`
  }
}

const { Page, getServerSideProps } = createDynamicFederatedPage({
  getContainer: importDelegatedModule,
  pathResolver: customPathResolver
})

export { getServerSideProps }
export default Page;
