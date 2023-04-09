import dynamic from 'next/dynamic';
// @ts-ignore
const ExposedPages = dynamic(() => import('shop/pages/shop/exposed-pages'));
export default ExposedPages;
