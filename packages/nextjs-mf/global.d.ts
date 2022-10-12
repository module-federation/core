/* eslint-disable no-var */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/webpack/module.d.ts" />

declare module 'webpack/lib/container/options';
declare module 'webpack/lib/sharing/utils';
declare global {
  var __remote_scope__: any;
}
