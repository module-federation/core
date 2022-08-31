import { useRouter } from 'next/router';

export default function CheckoutSlug() {
  const router = useRouter();
  return (
    <div>
      <h1>Checkout with slug = {router.query?.slug}!!! </h1>
      <pre>{JSON.stringify(router, undefined, 2)}</pre>
    </div>
  );
}
