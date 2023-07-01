import {
  QwikSubmitEvent,
  component$,
  useSignal,
  useStylesScoped$,
  $,
} from '@builder.io/qwik';
import { $translate as t } from 'qwik-speak';

import Button, { ButtonTheme } from '../../button/button';
import Section from '../../section/section';
import { centerShape, leftShape, rightShape } from './shapes';
import styles from './subscribe.css?inline';
import Line from '../../line/line';

export default component$(() => {
  useStylesScoped$(styles);

  const loading = useSignal(false);
  const success = useSignal(false);

  const handleSubmit = $((event: QwikSubmitEvent<HTMLFormElement>) => {
    const form = event.target as any;
    const formData = new FormData(form);

    if (!formData.get('email')) {
      return;
    }

    loading.value = true;
    success.value = false;

    fetch('/docs/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString(),
    })
      .then(() => {
        success.value = true;
        loading.value = false;
        form.reset();
      })
      .catch((error) => (loading.value = false));
  });

  return (
    <Section>
      <div class="flex flex-col items-center">
        <div class="flex flex-col items-center gap-8">
          <h2 class="text-4xl leading-normal md:text-3xl text-blue-gray-900 font-bold max-w-lg mx-auto text-center leading-tight">
            {t('subscribe.title@@Subscribe to our email newsletter!')}
          </h2>

          {success.value && (
            <div class="text-sm text-green-700 text-center">
              Subscribed successfully!
            </div>
          )}

          {!success.value && (
            <form
              onSubmit$={async (e) => handleSubmit(e as any)}
              preventdefault:submit
              class="flex flex-col md:grid md:grid-cols-[1fr_auto] items-center w-full gap-4"
            >
              <input type="hidden" name="form-name" value="subscribe" />
              <input
                class="min-h-[44px] h-full w-full border-blue-gray-900 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                type="email"
                name="email"
                id="email"
                placeholder={t('subscribe.input.placeholder@@Enter your email')}
              />

              <Button
                class="whitespace-nowrap w-full md:w-auto"
                theme={ButtonTheme.SOLID}
                type="submit"
                small
                loading={loading.value}
              >
                {t('subscribe.action@@Subscribe')}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div
        q:slot="background"
        class="relative w-11/12 h-full max-w-1225 mx-auto"
      >
        <div class="absolute w-36 md:w-48 bottom-0 left-0 translate-y-1/2 ">
          {leftShape}
        </div>
        <div class="absolute w-56 md:w-72 top-0 left-[5%] md:left-[20%] -translate-y-1/2  md:-translate-y-1/3 ">
          {centerShape}
        </div>
        <div class="absolute w-36 md:w-56 top-1/2 right-0 -translate-x-1/3 md:-translate-y-1/2 ">
          {rightShape}
        </div>
      </div>

      <div q:slot="background-no-overlay">
        <Line
          showEnd={false}
          class="absolute w-12 md:w-1/4 top-[25%] md:top-[60%] right-0"
        />
        <Line
          showStart={false}
          class="absolute w-24 md:w-52 top-0 left-[12%] md:left-[14%] rotate-90 origin-left -translate-y-1/2"
        />
      </div>
    </Section>
  );
});
