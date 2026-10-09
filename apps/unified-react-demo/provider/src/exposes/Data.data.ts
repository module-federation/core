let request = 0;
// Deliberately no cache(): makes request ownership visible.
export async function fetchData() {
  const current = ++request;
  console.log('[unified demo] DataLoader request', current);
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    message: 'Fetched on provider',
    request: current,
    at: new Date().toISOString(),
  };
}
