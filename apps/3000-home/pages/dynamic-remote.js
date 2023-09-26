import React from 'react';
//eslint-disable-next-line
// import { injectScript } from '@module-federation/nextjs-mf/utilities';
// example of dynamic remote import on server and client
// const isServer = typeof window === 'undefined';
//could also use
// getModule({
//   remoteContainer: {
//     global: 'app2',
//     url: 'http://localhost:3002/remoteEntry.js',
//   },
//   modulePath: './sample'
// }).then((sample) => {
//   console.log(sample)
// });
// const dynamicContainer = injectScript({
//   global: 'checkout',
//   url: `http://localhost:3002/_next/static/${
//     isServer ? 'ssr' : 'chunks'
//   }/remoteEntry.js`,
// }).then((container) => {
//   return container.get('./CheckoutTitle').then((factory) => {
//     return factory();
//   });
// });
// const DynamicComponent = React.lazy(() => dynamicContainer);

// eslint-disable-next-line react/display-name
export default (props) => {
  return (
    <>
      {/*<React.Suspense>*/}
      {/*  <DynamicComponent />*/}
      {/*</React.Suspense>*/}
      <p>Code from GSSP:</p>
      <pre>{props.code}</pre>
    </>
  );
};

export async function getServerSideProps() {
  return {
    props: {
      // code: (await dynamicContainer).default.toString(),
    },
  };
}
