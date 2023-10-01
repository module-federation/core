import type { LoaderContext } from 'webpack';

/**
 * This function patches the default shared loader.
 * It requires either the default delegate module or a custom one.
 *
 * @param {LoaderContext<Record<string, unknown>>} this - The loader context.
 * @param {string} content - The content to be processed.
 * @returns {string} The processed content with required delegates.
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string,
) {
  const { delegates } = this.getOptions() as Record<string, string>;

  /**
   * Resolves delegates by splitting the delegate into request and query.
   * If a query is present, it is parsed and appended to the request.
   * The request is then contextified and absolutified.
   */
  const resolvedDelegates = Object.values(delegates).map((delegate) => {
    const [request, query] = delegate.replace('internal ', '').split('?');
    if (query) {
      const queries = [];
      for (const [key, value] of new URLSearchParams(query).entries()) {
        queries.push(`${key}=${encodeURIComponent(value)}`);
      }
      return this.utils.contextify(
        this.context,
        this.utils.absolutify(this._compiler?.context || '', request) +
          '?' +
          queries.join('&'),
      );
    }
    return request;
  });

  /**
   * If the content includes 'hasDelegateMarkers', return the content as is.
   */
  if (content.includes('hasDelegateMarkers')) {
    return content;
  }

  /**
   * Requires each resolved delegate and appends it to the content.
   */
  const requiredDelegates = resolvedDelegates.map((delegate) => {
    return `require('${delegate}')`;
  });

  return ['', ...requiredDelegates, '//hasDelegateMarkers', content].join('\n');
}
