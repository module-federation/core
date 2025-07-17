//@ts-ignore
import Page from 'checkout/pages/checkout/index';
const Checkout = Page;
// the data loading method needs to be here so next can static analyze it properly.
// eslint-disable-next-line no-self-assign
Checkout.getInitialProps = Page.getInitialProps;

// Add HMR support for federation page component
if (typeof module !== 'undefined' && module.hot) {
  module.hot.accept(['checkout/pages/checkout/index'], () => {
    console.log('[HMR] Checkout page component updated, forcing refresh');
    // Force a complete refresh of this page to avoid hydration mismatches
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  });
}

export default Checkout;
