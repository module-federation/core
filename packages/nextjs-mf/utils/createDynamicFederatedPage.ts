import * as React from 'react'
import { importDelegatedModule } from '@module-federation/utilities'
import type { RuntimeRemote, WebpackRemoteContainer } from '@module-federation/utilities'
import { useRouter } from 'next/router'
import { GetServerSideProps, Redirect } from 'next/types'

export type PathResolver = (path: string) => {
  remoteContainer: string | RuntimeRemote,
  modulePath: string
}

function defaultPathResolver(path: string) {
  const trimmedPath = path.replace(/^\/+/, '')
  const slashIndex = trimmedPath.indexOf('/')
  const remoteContainer = slashIndex > -1 ? trimmedPath.substring(0, slashIndex) : trimmedPath
  const modulePath = slashIndex > -1 ? trimmedPath.substring(slashIndex) : '/index'

  return {
    remoteContainer,
    modulePath: `.${modulePath}`
  }
}

export type ErrorHandler = (error: unknown) => { redirect: Redirect } | { notFound: true }

function defaultErrorHandler(error: unknown) {
  console.error(error)
  return {
    notFound: true,
  } as const
}

function removeQueryParams(path: string) {
  // is this better than "path.split('?')[0]" ?
  const fakeBaseURL = 'https://example.com';
  const url = new URL(path, fakeBaseURL);
  return url.pathname;
}

/**
 * This function creates a dynamic page that is loaded from a remote defined by the path.
 * @typedef {Object} CreateDynamicFederatedPageOptions
 * @property pathResolver - function to obtain remote container name and module path from the page path, by default it's a simple path splitting
 * @property errorHandler - function to handle errors, by default it just logs the error and returns 404
 * @property suspenseFallback - fallback to render while remote module is loading, by default it's null
 * @property getContainer - function to load remote container, by default it's importDelegatedModule
 */
interface CreateDynamicFederatedPageOptions {
  pathResolver?: PathResolver,
  errorHandler?: ErrorHandler,
  suspenseFallback?: React.ReactNode
  getContainer?: (remote: string | RuntimeRemote) => Promise<WebpackRemoteContainer | any>
}

export function createDynamicFederatedPage({
  pathResolver = defaultPathResolver,
  errorHandler = defaultErrorHandler,
  suspenseFallback = null,
  getContainer = importDelegatedModule,
}: CreateDynamicFederatedPageOptions = {}) {
  const getRemoteModule = async (path: string) => {
    const { remoteContainer, modulePath } = pathResolver(path)

    const container = await getContainer(remoteContainer)
    // @ts-ignore
    return await container.get(modulePath)?.then((factory) => factory())
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
    const path = removeQueryParams(router.asPath)

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
    const path = removeQueryParams(ctx.resolvedUrl)

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
