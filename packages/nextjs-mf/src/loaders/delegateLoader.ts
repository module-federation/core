import type {LoaderContext} from 'webpack';
import path from 'path';

/**
 *
 * Requires `include-defaults.js` with required shared libs
 *
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {

  const {delegates} = this.getOptions() as Record<string, string>;

  const resolvedDelegates = Object.values(delegates).map((delegate) => {
    const [request, query] = delegate.replace('internal ','').split('?')
    if(query) {
      let queries = [];
      for (const [key, value] of new URLSearchParams(query).entries()) {
        queries.push(`${key}=${value}`)
      }
      return path.resolve(this._compiler?.context || '', request) + '?' + queries.join('&')
    } else {
      return path.resolve(this._compiler?.context || '', request)
    }
  })


  const requiredDelegates = resolvedDelegates.map((delegate) => {
    return `require('${delegate}')`
  })

  return [
    '',
    ...requiredDelegates,
    '',
    content
  ].join("\n")
}

