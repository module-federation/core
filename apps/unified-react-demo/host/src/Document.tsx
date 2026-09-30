import { Html, Head, Body, Root, Scripts } from '@modern-js/runtime/document';
import snapshot from '../static-snapshot.json';
export default function Document() {
  return (
    <Html>
      <Head>
        {process.env.DEMO_MODE === 'snapshot' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `globalThis.__FEDERATION__ = globalThis.__FEDERATION__ || {}; globalThis.__FEDERATION__.moduleInfo = Object.assign(globalThis.__FEDERATION__.moduleInfo || {}, ${JSON.stringify(snapshot).replace(/</g, '\\u003c')});`,
            }}
          />
        )}
      </Head>
      <Body>
        <Root />
        <Scripts />
      </Body>
    </Html>
  );
}
