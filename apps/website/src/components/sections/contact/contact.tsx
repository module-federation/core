import {
  component$,
  useStylesScoped$,
  $,
  QwikSubmitEvent,
  useSignal,
} from '@builder.io/qwik';
import { $translate as t, useSpeakContext } from 'qwik-speak';
import Button, { ButtonTheme } from '../../button/button';
import { ContainerTheme } from '../../container/container';
import Section, { SectionHeader } from '../../section/section';
import styles from './contact.css?inline';
import { localizedUrl as locUrl } from '../../../speak-config';

export default component$(() => {
  useStylesScoped$(styles);

  const loading = useSignal(false);
  const success = useSignal(false);

  const speakState = useSpeakContext();
  const localizedUrl = (url: string) => {
    return locUrl(url, speakState);
  };

  const handleSubmit = $((event: QwikSubmitEvent<HTMLFormElement>) => {
    const form = event.target as any;
    const formData = new FormData(form);

    if (!formData.get('companyEmail')) {
      return;
    }

    if (!formData.get('name')) {
      return;
    }

    if (!formData.get('howCanWeHelp')) {
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

  const title = t('contact.title@@Talk to our experts');

  return (
    <Section id="contact" class="scroll-mt-32" theme={ContainerTheme.OPAQUE}>
      <SectionHeader q:slot="header" title={title} />
      <div class="flex flex-col lg:flex-row gap-10 ">
        <div class="flex flex-col items-center gap-4 flex-1 w-50">
          <form
            class="flex-1 w-50 bg-[#EFEFFF] w-full flex flex-col md:grid md:grid-cols-2 gap-4 p-6"
            onSubmit$={async (e) => handleSubmit(e as any)}
            preventdefault:submit
          >
            <input type="hidden" name="form-name" value="contact" />

            <div class="flex flex-col gap-1">
              <label class="text-blue-gray-500" for="companyEmail">
                {t('contact.form.company-email.label@@Company email')}
              </label>
              <input
                class="min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                type="email"
                name="companyEmail"
                id="companyEmail"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-blue-gray-500" for="companyEmail">
                {t('contact.form.name.label@@Your name')}
              </label>
              <input
                class="min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                type="text"
                name="name"
                id="name"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-blue-gray-500" for="companySize">
                {t('contact.form.company-size.label@@Company size')}
              </label>
              <input
                class="min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                type="text"
                name="companySize"
                id="companySize"
              />
            </div>
            <div class="flex flex-col gap-1 text-blue-gray-500">
              <label class="text-blue-gray-500" for="companyWebsite">
                {t('contact.form.company-website.label@@Company website')}
              </label>
              <input
                class="min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                type="text"
                name="companyWebsite"
                id="companyWebsite"
              />
            </div>
            <div class="flex flex-col gap-1 col-span-2">
              <label class="text-blue-gray-500" for="howCanWeHelp">
                {t(
                  'contact.form.how-can-we-help-you.label@@How can we help you?',
                )}
              </label>
              <textarea
                class="min-h-[44px] w-full border-blue-gray-500 px-4 py-1.5 pr-8 bg-white  focus:border-ui-blue"
                name="howCanWeHelp"
                id="howCanWeHelp"
                rows={4}
              ></textarea>
            </div>

            <div class="flex justify-end items-center col-span-2">
              {success.value && (
                <div class="text-sm pr-6 text-green-700">
                  Form submitted successfully!
                </div>
              )}

              <Button
                class="w-full md:w-auto md:min-w-[200px]"
                theme={ButtonTheme.SOLID}
                type="submit"
                loading={loading.value}
                small
              >
                {t('contact.form.action@@Submit')}
              </Button>
            </div>
          </form>

          <div class="text-blue-gray-900 font-normal max-w-sm text-center text-lg leading-tight">
            {t(
              'contact.disclaimer.text@@By submitting this form, I confirm that I have read and understood the',
            )}{' '}
            <a class="text-ui-blue" href={localizedUrl('/privacy-policy')}>
              {t('contact.disclaimer.action@@Privacy & Policy')}
            </a>
            .
          </div>
        </div>
        <div class="flex flex-col gap-10 flex-1 w-50">
          <div class="text-blue-gray-900 text-3xl font-medium text-center md:text-left leading-normal">
            {t(
              'contact.quote.text@@There are now 4000 companies using Module Federation in a detectable way. Likely many more who we cannot trace, but 4000 is still an impressive number of known entities.',
            )}
          </div>

          <div class="flex items-center justify-center md:justify-start gap-4">
            <img
              class="w-12 h-12"
              src="/photos/zack_jackson.png"
              alt={t('contact.quote.author.name@@Zack Jackson')}
            />
            <div>
              <div class="text-blue-gray-900 font-bold text-lg">
                {t('contact.quote.author.name@@Zack Jackson')}
              </div>
              <div class="text-blue-gray-900 font-normal text-lg">
                {t(
                  'contact.quote.author.title@@the сreator of Module Federation',
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
});
