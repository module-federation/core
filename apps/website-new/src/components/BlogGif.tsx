import React from 'react';

interface BlogGifProps {
  src: string;
  alt?: string;
  title?: string;
  style?: React.CSSProperties;
}

export default function BlogGif({
  src,
  alt = '',
  title,
  style = {},
}: BlogGifProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      {title && <div style={{ marginBottom: '8px' }}>{title}</div>}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          display: 'block',
          ...style,
        }}
      />
    </div>
  );
}
