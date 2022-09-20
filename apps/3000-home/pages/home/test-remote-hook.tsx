import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const page = import('./test-remote-hook.real');

const Page = dynamic(() => import('./test-remote-hook.real'), {
  ssr: false,
}) as NextPage;

Page.getInitialProps = async (ctx) => {
  const getInitialProps = (await page).default?.getInitialProps;

  if (getInitialProps) {
    return getInitialProps(ctx);
  }

  return {};
};

export default Page;
