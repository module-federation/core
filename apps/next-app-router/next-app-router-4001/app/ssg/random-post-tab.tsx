'use client';

import { Tab } from '#/ui/tab';
import clsx from 'clsx';
import React from 'react';

const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export function RandomPostTab({ path }: { path: string }) {
  const [post] = React.useState(() => {
    const randomId = String(randomNumber(3, 100));
    return { text: `Post ${randomId} (On Demand)`, slug: randomId };
  });

  return (
    <div
      className={clsx('inline-flex transition', {
        'opacity-100': Boolean(post),
      })}
    >
      <Tab path={path} item={post} />
    </div>
  );
}
