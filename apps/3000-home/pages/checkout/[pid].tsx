import dynamic from 'next/dynamic';
// @ts-ignore
const Pid = dynamic(() => import('shop/pages/shop/index'));
export default Pid;
