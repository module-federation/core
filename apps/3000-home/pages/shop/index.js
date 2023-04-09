import dynamic from 'next/dynamic';
const Shop = dynamic(() => import('shop/pages/shop/index'));
const Page = Shop;
Page.getInitialProps = (ctx) => import('shop/pages/shop/index').then((mod) => mod?.getInitialProps(ctx));
export default Page;
