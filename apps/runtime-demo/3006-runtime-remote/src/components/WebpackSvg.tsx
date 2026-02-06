import React from 'react';
import svg from '../../public/webpack.svg';

export default function WebpackSvg() {
  return React.createElement('img', {
    className: 'remote1-webpack-svg',
    src: svg,
    alt: 'webpack svg',
  });
}
