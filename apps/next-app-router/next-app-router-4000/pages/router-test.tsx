import React from 'react';
import Link from 'next/link';
import Page from 'home_app/pages/index';
console.log(Page);
const RouterTestPage = () => {
  return (
    <div>
      <Page />
      <h1>Router Test Page (in Pages Directory)</h1>
      <p>
        This page exists in the 'pages' directory of an app that primarily uses
        the App Router ('app' directory).
      </p>
      <p>
        Below are links demonstrating navigation potentially involving different
        router types:
      </p>
      <ul>
        <li>
          {/* Link within the current app (likely handled by App Router if root exists there) */}
          <Link href="/">Link to App Root</Link>
        </li>
        <li>
          {/* Link to an external app known to use Pages Router */}
          <a href="http://localhost:3000/">
            Link to Home App (Pages Router via full URL)
          </a>
        </li>
        <li>Placeholder for other routing/federation examples.</li>
      </ul>
      <p>
        Note: The instruction "sets both routers" was interpreted as
        demonstrating links to potentially different router contexts.
      </p>
    </div>
  );
};

export default RouterTestPage;
