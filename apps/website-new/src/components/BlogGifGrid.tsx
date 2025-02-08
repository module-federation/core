import React from 'react';
import BlogGif from './BlogGif';

interface GifItem {
  src: string;
  alt?: string;
  title?: string;
}

interface BlogGifGridProps {
  items: GifItem[];
  gap?: string;
}

export default function BlogGifGrid({ items, gap = '20px' }: BlogGifGridProps) {
  return (
    <div style={{ display: 'flex', gap, justifyContent: 'space-between' }}>
      {items.map((item, index) => (
        <div key={index} style={{ flex: 1 }}>
          <BlogGif {...item} />
        </div>
      ))}
    </div>
  );
}
