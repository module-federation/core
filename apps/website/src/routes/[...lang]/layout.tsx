import { component$, Slot } from '@builder.io/qwik';

import { RequestEvent, RequestHandler } from '@builder.io/qwik-city';
import { config } from '../../speak-config';

export default component$(() => {
  return <Slot />;
});

export const onRequest: RequestHandler = ({ params, locale }) => {
  console.log(params);

  const lang = params.lang;
  
  locale(lang || config.defaultLocale.lang);
};
