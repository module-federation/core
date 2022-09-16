import Link from 'next/link';

export default function TestBrokenRemotes() {
  return (
    <div>
      <h2>This page is a test for broken remoteEntries.js</h2>

      <p>
        Check unresolved host –{' '}
        <Link href="/unresolved-host">
          <a>/unresolved-host</a>
        </Link>{' '}
        (on http://localhost:<b>3333</b>/_next/static/chunks/remoteEntry.js)
      </p>
      <p>
        Check wrong response for remoteEntry –{' '}
        <Link href="/wrong-entry">
          <a>/wrong-entry</a>
        </Link>{' '}
        (on http://localhost:3000/_next/static/chunks/remoteEntry<b>Wrong</b>
        .js)
      </p>
    </div>
  );
}
