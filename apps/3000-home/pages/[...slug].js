import { injectScript } from '@module-federation/utilities'
import { createDynamicFederatedPage } from '@module-federation/nextjs-mf/utils'

const { Page, getServerSideProps } = createDynamicFederatedPage({
  injectScriptReplacement: injectScript
})

export { getServerSideProps }
export default Page;
