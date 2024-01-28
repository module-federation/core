// @ts-ignore
import Button from 'home/button';

export default function Home() {
  return (
    <main className="text-black bg-white">
      <p className="text-2xl font-semibold">Page using pages router</p>
      <Button />

      <p>
        <a href="/home">VIsit app router</a>
      </p>
    </main>
  );
}
