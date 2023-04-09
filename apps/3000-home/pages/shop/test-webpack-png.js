import dynamic from 'next/dynamic';
const TestPng = dynamic(()=>import('shop/pages/shop/test-webpack-png'));

export default TestPng;
