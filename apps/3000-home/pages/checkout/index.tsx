import dynamic from 'next/dynamic';
// @ts-ignore
const Page = dynamic(()=>import('checkout/pages/checkout/index'));

const Checkout = Page;
//@ts-ignore
Checkout.getInitialProps = async (ctx) => import('checkout/pages/checkout/index').then((mod) => mod?.getInitialProps(ctx));

export default Checkout;
