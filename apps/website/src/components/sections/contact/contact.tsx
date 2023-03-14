import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Section, { SectionHeader } from '../../section/section';
import styles from './contact.css?inline';

// TODO: Check why #EFEFFF is not in the color scheme
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Section>
      <SectionHeader q:slot="header" title="Talk to our experts" />
      <div class="flex gap-10 ">
        <div class="flex flex-col items-center gap-10 flex-1 w-50">
          <div class="flex-1 w-50 bg-[#EFEFFF] w-full">todo</div>
          <div class="text-blue-grey-900 font-normal max-w-sm text-center text-lg">
            By submitting this form, I confirm that I have read and understood
            the <a class="text-[#00B9FF]" href="#">Privacy & Policy</a>.
          </div>
        </div>
        <div class="flex flex-col gap-10 flex-1 w-50">
          <div class="text-blue-grey-900 text-3xl font-medium">
            There are now 4000 companies using Module Federation in a detectable
            way. Likely many more who we cannot trace, but 4000 is still an
            impressive number of known entities.
          </div>

          <div class="flex items-center gap-4">
            <img
              class="w-12 h-12"
              src="photos/zack_jackson.png"
              alt="Zack Jackson"
            />
            <div>
              <div class="text-blue-grey-900 font-bold text-lg">
                Zack Jackson
              </div>
              <div class="text-blue-grey-900 font-normal text-lg">
                the сreator of Module Federation
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
});
