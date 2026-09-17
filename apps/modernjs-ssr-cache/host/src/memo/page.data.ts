const id = Math.random().toString(36).slice(2, 10);
let count = 0;
export const loader = async ({ request }) => {
  if (new URL(request.url).searchParams.get('add') === '1') count++;
  return { id, count, pid: process.pid };
};
