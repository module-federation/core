import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Container from '../../container/container';
import styles from './discord.css?inline';

// TODO: Check why #00B9FF is not on collor pallete
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container>
      <section class="flex flex-col items-center p-28">
        <p class="text-3xl text-blue-grey-900 font-bold max-w-lg mx-auto text-center">
          Join to Module Federation community in <a class="text-[#00B9FF] underline decoration-solid decoration-1 underline-offset-2" href="#">Discord</a>
        </p>
      </section>
    </Container>
  );
});
