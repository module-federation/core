//@ts-nocheck

interface MyInterface {
  foo: string;
  bar: number;
}

(async () => {
  setTimeout(async () => {
    const { bootstrap } = await import('./bootstrap');
    bootstrap();
  }, 400);
})();
