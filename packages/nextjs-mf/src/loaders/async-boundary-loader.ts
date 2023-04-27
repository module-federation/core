/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zack Jackson @ScriptedAlchemy
*/

import type { LoaderContext, NormalModule } from 'webpack';

const pageTemplate = (request: string) =>
  `
    console.log(__webpack_share_scopes__);

    import dynamic from "next/dynamic";
    const AsyncBoundary = dynamic(() => import("${request}").then(async(mod)=>{
      let innerModule = await mod?.default?.Underlying;
      innerModule = innerModule?.default || innerModule;
      return innerModule || mod;
    }), {suspense:true});

    AsyncBoundary.Underlying = import("${request}");
    export default AsyncBoundary;
    `;

const getInitialPropsTemplate = (request: string) =>
  `
    AsyncBoundary.getInitialProps = async (ctx) => {
      return import("${request}").then((mod) => {
        const page = mod.default || mod;
        return page.getInitialProps(ctx)
      })
    }
    `;

const getStaticPropsTemplate = (request: string) =>
  `
    export const getStaticProps = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getStaticProps(ctx)
      })
    }
    `;

const getServerSidePropsTemplate = (request: string) =>
  `
    export const getServerSideProps = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getServerSideProps(ctx)
      })
    }
    `;

const getStaticPathsTemplate = (request: string) =>
  `
    export const getStaticPaths = async (ctx) => {
      return import("${request}").then((mod) => {
        return mod.getStaticPaths(ctx)
      })
    }
    `;

export default function (
  this: LoaderContext<Record<string, unknown>>,
  source: string,
  sourceMap: string
) {
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
