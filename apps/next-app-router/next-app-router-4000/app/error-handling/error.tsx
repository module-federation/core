'use client';

import Button from '#/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-lg font-bold">Something went wrong!</h1>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
