import { useState } from 'react';

export default function ProductPanel() {
  const [items, setItems] = useState(0);

  return (
    <section aria-labelledby="catalog-heading">
      <h2 id="catalog-heading">Remote catalog</h2>
      <p>Analytical Engine starter kit</p>
      <button type="button" onClick={() => setItems((count) => count + 1)}>
        Add item ({items})
      </button>
    </section>
  );
}
