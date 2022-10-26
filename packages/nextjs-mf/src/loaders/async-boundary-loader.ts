/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zack Jackson @ScriptedAlchemy
*/
// @ts-ignore
import loaderUtils from "loader-utils";
import type { LoaderContext , NormalModule} from 'webpack';

const pageTemplate = (request: string) => {
  return (
    `
    import dynamic from "next/dynamic"
    const AsyncBoundary = dynamic(() => import("${request}"), {suspense:true});
    export default AsyncBoundary;
    `
  )
}

const getInitialPropsTemplate = (request: string) => {
  return (
    `
    AsyncBoundary.getInitialProps = async (ctx) => {
      return await import("${request}").then((mod) => {
        const page = mod.default || mod;
        return page.getInitialProps(ctx)
      })
    }
    `
  )
}

const getStaticPropsTemplate = (request: string) => {
  return (
    `
    export const getStaticProps = async (ctx) => {
      return await import("${request}").then((mod) => {
        return mod.getStaticProps(ctx)
      })
    }
    `
  )
}

const getServerSidePropsTemplate = (request: string) => {
  return (
    `
    export const getServerSideProps = async (ctx) => {
      return await import("${request}").then((mod) => {
        return mod.getServerSideProps(ctx)
      })
    }
    `
  )
}

const getStaticPathsTemplate = (request: string) => {
  return (
    `
    export const getStaticPaths = async (ctx) => {
      return await import("${request}").then((mod) => {
        return mod.getStaticPaths(ctx)
      })
    }
    `
  )
}

export const pitch = function( this: LoaderContext<Record<string, unknown>>, remainingRequest: string) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  const loaderWithoutBoundaryOrShared = this.request.split('!').filter((loader) => {
    return !loader.includes('async-boundary-loader') && !loader.includes('patchDefaultSharedLoader')
  }).join('!');

  const loaderWithoutBoundary = this.request.split('!').filter((loader) => {
    return !loader.includes('async-boundary-loader')
  }).join('!');

  //@ts-ignore
  // if(this.target === 'web') {
  //   this.importModule(
  //     `${this.resourcePath}.webpack[javascript/auto]` + `!=!${loaderWithoutBoundary}`,
  //     {},
  //     /**
  //      * @param {Error | null | undefined} error
  //      * @param {object} exports
  //      */
  //     (error: Error | null | undefined, exports: {}) => {
  //       if (error) {
  //         callback(error);
  //
  //         return;
  //       }
  //       //@ts-ignore
  //       const hasGIP = !!exports?.default?.getInitialProps;
  //       console.log({hasGIP, file: this.resourcePath})
  //       var result = [
  //         "module.exports = {}"];
  //
  //       callback(null,result.join(""))
  //     }
  //   );
  // } else {
    //@ts-ignore
    // this.loaders[0].options.isServer = false
    //
    // this.importModule(
    //   `${this.resourcePath}.webpack[javascript/auto]` + `!=!${loaderWithoutBoundary}`,
    //   {},
    //   (error: Error | null | undefined, exports: {}) => {
    //     if (error) {
    //       callback(error);
    //
    //       return;
    //     }
    //     console.log({exports, file: this.resourcePath})
    //   }
    // )
    // return

    this.loadModule(
      `${this.resourcePath}.webpack[javascript/auto]` + `!=!${loaderWithoutBoundaryOrShared}`,
      /**
       * @param {Error | null | undefined} error
       * @param {object} exports
       */
      (error: Error | null | undefined, source:string, sourceMap: string, module:NormalModule ) => {
        if (error) {
          callback(error);

          return;
        }
//@ts-ignore
        const hasGIP = !!source.includes('getInitialProps');
        const hasGSP = !!source.includes('getStaticProps');
        const hasGSSP = !!source.includes('getServerSideProps');
        const hasGSPT = !!source.includes('getStaticPaths');

        const relativeResource = this.utils.contextify(
          this.context,
          this.resource
        );


        var result = [
          pageTemplate(`${this.resource}?hasBoundary`)
        ];

        if(hasGIP) {
          result.push(getInitialPropsTemplate(`${relativeResource}?hasBoundary`))
        }

        if(hasGSP) {
          result.push(getStaticPropsTemplate(`${relativeResource}?hasBoundary`))
        }

        if(hasGSSP) {
          result.push(getServerSidePropsTemplate(`${relativeResource}?hasBoundary`))
        }

        if(hasGSPT) {
          result.push(getStaticPathsTemplate(`${relativeResource}?hasBoundary`))
        }

        callback(null,result.join("\n"))
      }
    );
  // }

}
