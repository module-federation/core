import * as React from 'react';

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
        null
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
        null
      );
    });

  return React.createElement(React.Fragment, null, css, scripts);
};

export interface FlushedChunksProps {
  chunks: string[];
}
