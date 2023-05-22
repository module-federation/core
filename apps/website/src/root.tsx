import { component$, useStyles$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city';
import { QwikSpeakProvider } from 'qwik-speak';

import { RouterHead } from './components/router-head/router-head';

import globalStyles from './global.css?inline';
import { config, translationFn } from './speak-config';
import { QwikPartytown } from './components/partytown/partytown';

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
          <QwikPartytown forward={['dataLayer.push']} />
          <script
            async
            type="text/partytown"
            src="https://www.googletagmanager.com/gtag/js?id=G-SDV5HRTM4G"
          />
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
