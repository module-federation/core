import dynamic from 'next/dynamic';
// @ts-ignore
const CheckButtonPage = dynamic(()=>import('checkout/pages/checkout/test-check-button'));

export default CheckButtonPage;
