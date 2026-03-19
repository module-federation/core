import ProductPage from 'shop/pages/shop/products/[...slug]';

const Page = ProductPage;
Page.getInitialProps = async () => ({});

export default Page;
