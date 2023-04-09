import dynamic from 'next/dynamic';
// @ts-ignore
const ExposedPages = dynamic(()=>import('checkout/pages/checkout/exposed-pages'));
export default ExposedPages;
