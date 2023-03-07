import { component$, Slot } from '@builder.io/qwik';
import Navbar from '../components/navbar/navbar';

export default component$(() => {
  return (
    <>
      {/* TODO: Remove this! */}
      <main style="background: #F6F6FA">
        <Navbar />
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
