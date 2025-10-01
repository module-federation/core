'use client';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Script from 'next/script';
import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegments,
  useSelectedLayoutSegment,
} from 'next/navigation';
import { ExternalLink } from '#/ui/external-link';

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const segments = useSelectedLayoutSegments();
  const segment = useSelectedLayoutSegment();

  return (
    <>
      <Head>
        <title>Client Component Hooks Demo</title>
      </Head>
      <Script src="https://example.com/script.js" strategy="lazyOnload" />
      <div className="space-y-9">
        <div className="prose prose-sm prose-invert max-w-none">
          <h1 className="text-xl font-bold">Client Component Hooks</h1>
          <ul>
            <li>
              Current pathname: <code>{pathname}</code>
            </li>
            <li>
              Current params: <code>{JSON.stringify(params)}</code>
            </li>
            <li>
              Current search params:{' '}
              <code>{searchParams?.toString() ?? ''}</code>
            </li>
            <li>
              Current segments: <code>{segments?.join(', ') ?? ''}</code>
            </li>
            <li>
              Current segment: <code>{segment}</code>
            </li>
          </ul>
          <div className="flex gap-2">
            <ExternalLink href="https://nextjs.org/docs/app/api-reference/functions">
              Next.js App Router Hooks Docs
            </ExternalLink>
          </div>
          <button onClick={() => router.push('/')}>Go Home</button>
          <div className="mt-4">
            <Link href="/about">Go to About (with next/link)</Link>
          </div>
          <div className="mt-4">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
        </div>
      </div>
    </>
  );
}
