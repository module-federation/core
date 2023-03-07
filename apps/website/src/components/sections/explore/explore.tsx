import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './explore.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <section>
      <div>
        <div>Icon</div>
        <div>
          <h3>Practical Module Federation</h3>
          <a href="#">Get the book</a>
        </div>
      </div>

      <div>
        <div>Icon</div>
        <div>
          <h3>Implementing Module Federation</h3>
          <a href="#">Learn more</a>
        </div>
      </div>

      <div>
        <div>Icon</div>
        <div>
          <h3>Conference talks</h3>
          <a href="#">Watch now</a>
        </div>
      </div>

      <div>
        <div>Icon</div>
        <div>
          <h3>Community content</h3>
          <a href="#">Find out more</a>
        </div>
      </div>

      <div>
        <div>Icon</div>
        <div>
          <h3>Module Federation courses</h3>
          <p>Gain expertise in Module Federation and enhance your skills now</p>
          <a href="#">Start exploring</a>
        </div>
      </div>
    </section>
  );
});
