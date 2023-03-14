import { component$, useStylesScoped$ } from '@builder.io/qwik';
import Button, { ButtonTheme } from '../../button/button';
import Container from '../../container/container';
import styles from './subscribe.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <Container>
      <div class="flex flex-col items-center p-28 gap-8">
        <h2 class="text-3xl text-blue-grey-900 font-bold max-w-lg mx-auto text-center">
          Subscribe to our email newsletter!
        </h2>

        <div>
          <input type="email" name="email" id="email" placeholder='TODO: Forms!' />

          <Button theme={ButtonTheme.SOLID} type="button" small>
            Subscribe
          </Button>
        </div>
      </div>
    </Container>
  );
});
