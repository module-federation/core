'use client';
import Button from '#/ui/button';

export default function BuggyButton() {
  return (
    <Button
      onClick={() => {
        throw new Error('Sentry Frontend Error');
      }}
    >
      Trigger Error
    </Button>
  );
}
