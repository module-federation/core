import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Container from '../../container/container';
import styles from './sponsor.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container>
      <div class="flex flex-col items-center p-28 gap-8">
        <h2 class="text-3xl text-blue-grey-900 font-bold mx-auto text-center">
          Sponsor Module Federation
        </h2>

        <p class="text-blue-grey-900 font-medium text-lg text-center">
          Sponsoring Module Federation offers the chance to be part of a
          technology community making a positive impact and receive benefits and
          recognition opportunities in return.
        </p>

        <Button theme={ButtonTheme.SOLID} href="#" type="link">
          Become a sponsor
        </Button>
      </div>
    </Container>
  );
});
