import Counter from '../Counter';
import Palette from '../Palette';
import '../page.css';
export default function Provider() {
  return (
    <main className="scene">
      <header>Modern Remote Provider</header>
      <Counter />
      <Palette />
    </main>
  );
}
