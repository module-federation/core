import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProductPage() {
  const [cnt, setCounter] = useState(0);
  const router = useRouter();
  useEffect(() => {
    setInterval(() => {
      setCounter((s) => s + 1);
    }, 1000);
  }, []);
  const { query } = useRouter();

  if (cnt === 0) return null;

  return (
    <div>
      <Link href="/shop/nodkz/aaaaaaaaa">Test dynamic route (nodkz)</Link>
      <Link href="/shop/test/aaaaaaaaa">Test dynamic route (test)</Link>
      <h1>Product with id {query?.slug}!!! </h1>
      <div>{cnt}</div>
      <pre>{JSON.stringify(router, undefined, 2)}</pre>
    </div>
  );
}
