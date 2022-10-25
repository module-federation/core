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
// console.log('pitch', this.resourcePath, remainingRequest)
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
        console.log({hasGIP, hasGSP, hasGSSP, hasGSPT, file: this.resourcePath})

        var result = [
          pageTemplate(`!!${loaderWithoutBoundary}`)
        ];

        if(hasGIP) {
          result.push(getInitialPropsTemplate(`!!${loaderWithoutBoundary}`))
        }

        if(hasGSP) {
          result.push(getStaticPropsTemplate(`!!${loaderWithoutBoundary}`))
        }

        if(hasGSSP) {
          result.push(getServerSidePropsTemplate(`!!${loaderWithoutBoundary}`))
        }

        if(hasGSPT) {
          result.push(getStaticPathsTemplate(`!!${loaderWithoutBoundary}`))
        }

        console.log(result)

        callback(null,result.join("\n"))
      }
    );
  // }

}
