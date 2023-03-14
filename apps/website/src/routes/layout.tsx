import { component$, Slot } from '@builder.io/qwik';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';

export default component$(() => {
  return (
    <>
      {/* TODO: Remove this! */}
      <main style="background: #F6F6FA">
        <Navbar />
        <section>
          <Slot />
        </section>
        <Footer />
      </main>
    </>
  );
});
