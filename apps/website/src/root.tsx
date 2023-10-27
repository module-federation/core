import { component$, useStyles$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city';
import { QwikSpeakProvider } from 'qwik-speak';

import { RouterHead } from './components/router-head/router-head';

import globalStyles from './global.css?inline';
import { config } from './speak-config';
import { translationFn } from './speak-functions';

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles);

  return (
    <QwikSpeakProvider config={config} translationFn={translationFn}>
      <QwikCityProvider>
        <head>
          <meta charSet="utf-8" />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-SDV5HRTM4G"
          ></script>
          <script
            dangerouslySetInnerHTML={`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SDV5HRTM4G');
          `}
          ></script>
          <link rel="manifest" href="/manifest.json" />
          <RouterHead />
        </head>
        <body class="relative w-full bg-mf-gray overflow-y-scroll">
          <div class="w-full overflow-x-hidden">
            <RouterOutlet />
          </div>
          <ServiceWorkerRegister />
        </body>
      </QwikCityProvider>
    </QwikSpeakProvider>
  );
});
