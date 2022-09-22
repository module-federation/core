import { Template } from 'webpack';
import { parseRemoteSyntax, generateRemoteTemplate } from '../src/internal';

const swc = require('@swc/core');

const transformInput = (code: string) => {
  // return swc.transformSync(code, {
  //   // Some options cannot be specified in .swcrc
  //   sourceMaps: false,
  //   // Input files are treated as module by default.
  //   isModule: false,
  //   // All options below can be configured via .swcrc
  //   jsc: {
  //     loose: false,
  //     target: 'es5',
  //     externalHelpers: false,
  //     parser: {
  //       syntax: 'ecmascript',
  //     },
  //     transform: {},
  //   },
  // }).code;

  return code;
};

// // To satisfy Typescript.
declare const remote: string;
//remote is defined in the template wrapper
const remoteTemplate = function () {
  console.log(__dirname);
  const pathName = require('path').resolve(__dirname, './common');
  const { extractUrlAndGlobal } = require(pathName);
  const [url, global] = extractUrlAndGlobal(remote);

  return generateRemoteTemplate(url, window[global as unknown as number]);
};

export const promiseFactory = (factory: string | Function) => {
  const wrapper = `new Promise(${factory.toString()})`;

  const isPromiseFactoryIncludesImportOrRequireContext = [
    'require(',
    'import(',
    'import ',
  ].some((statement) => wrapper.includes(statement));

  if (isPromiseFactoryIncludesImportOrRequireContext) {
    throw new Error(
      'promiseFactory does not support require, import, or import statements'
    );
  }

  const template = Template.asString([
    'function() {',
    Template.indent([wrapper]),
    '}',
  ]);

  return template;
};

export const promiseTemplate = (
  remote: string,
  ...otherPromises: Function[]
) => {
  let promises: string[] = [];

  if (otherPromises) {
    promises = otherPromises.map((p) => {
      return Template.getFunctionContent(
        promiseFactory(p) as unknown as Function
      );
    });
  }

  let remoteSyntax = remote;
  let remoteFactory = parseRemoteSyntax;

  if (
    typeof remote === 'function' ||
    remote.startsWith('function') ||
    remote.startsWith('(')
  ) {
    remoteSyntax = Template.getFunctionContent(
      promiseFactory(remote) as unknown as Function
    );

    remoteFactory = (remoteSyntax) => {
      return Template.asString([
        `${remoteSyntax}.then(function(remote) {`,
        // Template.indent([Template.getFunctionContent(remoteTemplate)]),
        '})',
      ]);
    };
  }

  const allPromises = [remoteFactory(remoteSyntax), ...promises].join(',\n');

  return Template.asString([
    'promise new Promise(function(resolve, reject) {',
    transformInput(
      Template.indent([
        'Promise.all([',
        Template.indent(allPromises),
        ']).then(function(promises) {',
        Template.indent(['resolve(promises[0]);']),
        '})',
      ])
    ),
    '})',
  ]);
};

// remotes: {
//   shop: promiseTemplate('global@url', (resolve,reject) => {}),
//     shop: promiseTemplate(
//     // can also be a string if it needs to be computed in scope
//     `(resolve, reject) => {
//                 resolve("${remotes.shop}");
//               }`,
//     (resolve,reject)=>{
//       console.log('runing other promise');
//       setTimeout(() => {
//         console.log('resolving promise');
//         resolve();
//       } , 1000);
//     }),
//     checkout: remotes.checkout,
// },
