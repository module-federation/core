'use client';

import Button from 'remote_4001/Button';

export default function RemoteButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Button>{children}</Button>;
}
