//@ts-nocheck
// import ButtonFromHome from 'home/button';
import federation from '/Volumes/sandisk/lulu_dev/universe/packages/webpack-bundler-runtime/dist/index.cjs.js';
import plugin_0 from '/Volumes/sandisk/lulu_dev/universe/packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.js';

// __webpack_require__.federation = {...federation,...__webpack_require__.federation};
// if(!__webpack_require__.federation.instance){
//   __webpack_require__.federation.initOptions.plugins = ([
//     plugin_0(),
//   ])
//   __webpack_require__.federation.instance = __webpack_require__.federation.runtime.init(__webpack_require__.federation.initOptions);
//   if(__webpack_require__.federation.attachShareScopeMap){
//     __webpack_require__.federation.attachShareScopeMap(__webpack_require__)
//   }
//   if(__webpack_require__.federation.installInitialConsumes){
//     __webpack_require__.federation.installInitialConsumes()
//   }
// }
const HomePage = () => {
  console.log('homepageapp');
  return (
    <>
      <p>Page from app router</p>
      {/*<ButtonFromHome />*/}
      <p>
        <a href="/">Visit p age router</a>
      </p>
    </>
  );
};

export default HomePage;
