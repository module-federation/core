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
    return path.resolve(this._compiler?.context || '',request) + '?remote=' + new URLSearchParams(query).get('remote')
  })


  const requiredDelegates = resolvedDelegates.map((delegate) => {
    return `require('${delegate}')`
  })

  // console.log(requiredDelegates);

  // avoid absolute paths as they break hashing when the root for the project is moved
  // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
  // const pathIncludeDefaults = path.relative(
  //   this.context,
  //   path.resolve(__dirname, '../include-defaults.js')
  // );
  //
  return [
    '',
    ...requiredDelegates,
    '',
    content
  ].join("\n")

  return content
}

