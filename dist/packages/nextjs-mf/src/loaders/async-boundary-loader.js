"use strict";
/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Zack Jackson @ScriptedAlchemy
*/
Object.defineProperty(exports, "__esModule", { value: true });
const pageTemplate = (request) => `
    import dynamic from "next/dynamic"
    const AsyncBoundary = dynamic(() => import("${request}"), {suspense:true});
    export default AsyncBoundary;
    `;
const getInitialPropsTemplate = (request) => `
    AsyncBoundary.getInitialProps = async (ctx) => {
      return import("${request}").then((mod) => {
        const page = mod.default || mod;
        return page.getInitialProps(ctx)
      })
    }
    `;
const getStaticPropsTemplate = (request) => `
    export const getStaticProps = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getStaticProps(ctx)
      })
    }
    `;
const getServerSidePropsTemplate = (request) => `
    export const getServerSideProps = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getServerSideProps(ctx)
      })
    }
    `;
const getStaticPathsTemplate = (request) => `
    export const getStaticPaths = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getStaticPaths(ctx)
      })
    }
    `;
function default_1(source, sourceMap) {
    this.cacheable && this.cacheable();
    const callback = this.async();
    if (this._compilation && this._compilation.name === 'ChildFederationPlugin') {
        callback(null, source, sourceMap);
        return;
    }
    const hasGIP = source.includes('getInitialProps');
    const hasGSP = source.includes('getStaticProps');
    const hasGSSP = source.includes('getServerSideProps');
    const hasGSPT = source.includes('getStaticPaths');
    const relativeResource = this.utils.contextify(this.context, this.resource);
    const result = [pageTemplate(`${relativeResource}?hasBoundary`)];
    if (hasGIP) {
        result.push(getInitialPropsTemplate(`${relativeResource}?hasBoundary`));
    }
    if (hasGSP) {
        result.push(getStaticPropsTemplate(`${relativeResource}?hasBoundary`));
    }
    if (hasGSSP) {
        result.push(getServerSidePropsTemplate(`${relativeResource}?hasBoundary`));
    }
    if (hasGSPT) {
        result.push(getStaticPathsTemplate(`${relativeResource}?hasBoundary`));
    }
    callback(null, result.join('\n'));
}
exports.default = default_1;
//# sourceMappingURL=async-boundary-loader.js.map