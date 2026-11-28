let expectedMessage: string | undefined;

// Register before Rstest's error listener; React 18 reports caught render errors globally.
window.addEventListener('error', (event) => {
  if (expectedMessage && event.error?.message === expectedMessage) {
    event.preventDefault();
  }
});

export async function withExpectedError(
  message: string,
  run: () => Promise<void>,
) {
  expectedMessage = message;
  try {
    await run();
  } finally {
    expectedMessage = undefined;
  }
}
