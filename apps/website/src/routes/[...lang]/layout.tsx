import { component$, Slot } from '@builder.io/qwik';

import { RequestHandler } from '@builder.io/qwik-city';
import { config } from '../../speak-config';

export default component$(() => {
  return <Slot />;
});

export const onRequest: RequestHandler = ({ params, locale }) => {
  const { lang } = params;

  locale(lang || config.defaultLocale.lang);
};
