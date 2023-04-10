import dynamic from 'next/dynamic';
const Shop = dynamic(() => import('shop/pages/shop/index'));
const Page = Shop;
Page.getInitialProps = async (ctx) => {
  const page = (await import('shop/pages/shop/index')).default;
  const gip = await page.getInitialProps(ctx);
  console.log('page', gip);
  return gip
}
export default Page;
