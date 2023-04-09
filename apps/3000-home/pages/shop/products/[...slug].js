import dynamic from 'next/dynamic';
//@ts-ignore
const ProductPage = dynamic(()=>import('shop/pages/shop/products/[...slug]'))
export default ProductPage;
