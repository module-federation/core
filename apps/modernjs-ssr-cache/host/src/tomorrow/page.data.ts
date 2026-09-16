import { forecast } from 'remote/Weather';
export const loader = async ({ request }) => ({
  ...(await globalThis.__weatherVisit(request)),
  forecast,
});
