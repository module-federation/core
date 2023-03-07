import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './navbar.css?inline';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <nav>
      <div>LOGO</div>
      <ul>
        <li><a href="/">Documentation</a></li>
        <li><a href="/">Discover</a></li>
        <li><a href="/">Showcase</a></li>
        <li><a href="/">Enterprise</a></li>
        <li><a href="/">Medusa</a></li>
      </ul>
      <div>TODO ACTIONS</div>
    </nav>
  );
});
