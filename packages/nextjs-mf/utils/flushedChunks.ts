import * as React from 'react';

/**
 * FlushedChunks component.
 * This component creates script and link elements for each chunk.
 *
 * @param {FlushedChunksProps} props - The properties of the component.
 * @param {string[]} props.chunks - The chunks to be flushed.
 * @returns {React.ReactElement} The created script and link elements.
 */
export const FlushedChunks = ({ chunks = [] }: FlushedChunksProps) => {
  const scripts = chunks
    .filter((c) => {
      // TODO: host shouldnt flush its own remote out
      // if(c.includes('?')) {
      //   return c.split('?')[0].endsWith('.js')
      // }
      return c.endsWith('.js');
    })
    .map((chunk) => {
      if (!chunk.includes('?') && chunk.includes('remoteEntry')) {
        chunk = chunk + '?t=' + Date.now();
      }
      return React.createElement(
        'script',
        {
          key: chunk,
          src: chunk,
          async: true,
        },
        null,
      );
    });

  const css = chunks
    .filter((c) => c.endsWith('.css'))
    .map((chunk) => {
      return React.createElement(
        'link',
        {
          key: chunk,
          href: chunk,
          rel: 'stylesheet',
        },
        null,
      );
    });

  return React.createElement(React.Fragment, null, css, scripts);
};

/**
 * FlushedChunksProps interface.
 * This interface represents the properties of the FlushedChunks component.
 *
 * @interface
 * @property {string[]} chunks - The chunks to be flushed.
 */
export interface FlushedChunksProps {
  chunks: string[];
}
