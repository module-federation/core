import React from 'react';
import png from '../../public/webpack.png';
import './a.css';

export default function WebpackPng() {
  return React.createElement('img', {
    className: 'remote1-webpack-png',
    src: png,
    alt: 'webpack png',
  });
}
