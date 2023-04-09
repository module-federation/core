import dynamic from 'next/dynamic';
// @ts-ignore
const SlugRoute = dynamic(()=>import('checkout/pages/checkout/[...slug]'));
export default SlugRoute;
