import dynamic from 'next/dynamic';
const TestSvg = dynamic(() => import('shop/pages/shop/test-webpack-svg'));
export default TestSvg;
