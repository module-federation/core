const loaderModuleInstance = Math.random().toString(36).slice(2, 10);
export const loader = async ({ request }) => {
  return {
    ...(await globalThis.__labRequest(request)),
    loaderModuleInstance,
  };
};
