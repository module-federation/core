//@ts-nocheck

(async () => {
  setTimeout(async () => {
    const { bootstrap } = await import('./bootstrap');
    bootstrap();
  }, 400);
})();
