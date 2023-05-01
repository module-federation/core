import * as React from 'react'
import { injectScript, getModule } from '@module-federation/utilities'
import type { RemoteData } from '@module-federation/utilities'
import { useRouter } from 'next/router'
import { GetServerSideProps, Redirect } from 'next/types'

export type ResolvedPathObject = {
  remoteContainer: string | RemoteData,
  modulePath: string,
  /**
   * In case of custom path resolver for parametrized routes,
   * this is the key to the remote module.
   * Example: path = '/storage/123', resolvedPath = '/storage/*'
   */
  resolvedPath: string
}

export type PathResolver = (path: string) => ResolvedPathObject

function defaultPathResolver(path: string): ResolvedPathObject {
  const trimmedPath = path.replace(/^\/+/, '')
  const slashIndex = trimmedPath.indexOf('/')
  const remoteContainer = slashIndex > -1 ? trimmedPath.substring(0, slashIndex) : trimmedPath
  const modulePath = slashIndex > -1 ? trimmedPath.substring(slashIndex) : '/index'

  return {
    remoteContainer,
    modulePath: `.${modulePath}`,
    resolvedPath: path,
  }
}

export type ErrorHandler = (error: unknown) => { redirect: Redirect } | { notFound: true }

function defaultErrorHandler(error: unknown): { redirect: Redirect } | { notFound: true } {
  console.error(error)
  return {
    notFound: true,
  }
}

/**
 * This function creates a dynamic page that is loaded from a remote defined by the path.
 * @typedef {Object} CreateDynamicFederatedPageOptions
 * @property pathResolver - function to obtain remote container name and module path from the page path, by default it's a simple path splitting
 * @property errorHandler - function to handle errors, by default it just logs the error and returns 404
 * @property suspenseFallback - fallback to render while remote module is loading
 * TODO: remove injectScriptReplacement when it's fixed in @module-federation/utilities
 * @property injectScriptReplacement - replacement for @module-federation/utilities/injectScript, which import is broken in @module-federation/nextjs-mf v6.4.0
 */
interface CreateDynamicFederatedPageOptions {
  pathResolver?: PathResolver,
  errorHandler?: ErrorHandler,
  suspenseFallback?: React.ReactNode
  injectScriptReplacement?: typeof injectScript,
}

export function createDynamicFederatedPage({
  pathResolver = defaultPathResolver,
  errorHandler = defaultErrorHandler,
  suspenseFallback = null,
  injectScriptReplacement = injectScript,
}: CreateDynamicFederatedPageOptions = {}) {
  const getRemoteModule = async (path: string) => {
    const { remoteContainer, modulePath } = pathResolver(path)
    const remoteContainerGlobal = typeof remoteContainer === 'string' ? remoteContainer : remoteContainer.global

    // getModule() doesn't work on server-side
    // and doesn't work on first render on client-side
    if (typeof window === 'undefined' || !(window as any)[remoteContainerGlobal]) {
      const container = await injectScriptReplacement(remoteContainer)
      // @ts-ignore
      return await container.get(modulePath)?.then((factory) => factory())
    } else {
      return await getModule({
        remoteContainer,
        modulePath,
      })
    }
  }

  const DynamicComponent = ({ props, path }: { props: React.Attributes, path: string }) => {
    const Component = React.useMemo(() => {
      return React.lazy(() => getRemoteModule(path))
    }, [path])

    return React.createElement(React.Suspense,
      { fallback: suspenseFallback },
      React.createElement(Component, props),
    )
  }

  const Page = (props: React.Attributes) => {
    const router = useRouter()
    const path = router.asPath.split('?')[0]

    // this is a hack to prevent infinity re-rendering
    // when navigating between pages with the same path and different slug
    const [oldPath, setOldPath] = React.useState(path)
    React.useEffect(() => {
      setOldPath(path)
    }, [path])
    if (path !== oldPath) {
      return null
    }
    // end hack

    return React.createElement(DynamicComponent, { props, path })
  }

  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const path = ctx.resolvedUrl.split('?')[0]

    try {
      const remoteModule = await getRemoteModule(path)

      if (typeof remoteModule.getServerSideProps === 'function') {
        return await remoteModule.getServerSideProps(ctx)
      }

      return {
        props: {},
      }
    } catch (e) {
      return errorHandler(e)
    }
  }

  return {
    Page,
    getServerSideProps,
  }
}
