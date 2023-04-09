import dynamic from 'next/dynamic';
//@ts-ignore
const CheckoutTitlePage = dynamic(() => import('checkout/pages/checkout/test-title'));
export default CheckoutTitlePage;
