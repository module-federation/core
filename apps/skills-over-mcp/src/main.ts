import('./bootstrap.ts').catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
