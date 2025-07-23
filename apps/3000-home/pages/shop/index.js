import Shop from 'shop/pages/shop/index';

const Page = Shop;
Page.getInitialProps = Shop.getInitialProps;

// Add HMR support for federation page component
if (typeof module !== 'undefined' && module.hot) {
  module.hot.accept(['shop/pages/shop/index'], () => {
    console.log('[HMR] Shop page component updated, forcing refresh');
    // Force a complete refresh of this page to avoid hydration mismatches
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  });
}

export default Page;
