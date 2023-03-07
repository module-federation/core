import { component$, Slot } from '@builder.io/qwik';
import Navbar from '../components/navbar/navbar';

export default component$(() => {
  return (
    <>
      <main>
        <Navbar />
        <section>
          <Slot />
        </section>
      </main>
    </>
  );
});
