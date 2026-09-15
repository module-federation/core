export const loader = async () => ({
  consolePid: process.pid,
  renderedAt: new Date().toISOString(),
});
