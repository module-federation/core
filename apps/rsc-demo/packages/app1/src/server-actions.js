'use server';

let actionCount = 0;

export async function incrementCount() {
  // Small delay ensures client-side loading state is observable in tests
  await new Promise((resolve) => setTimeout(resolve, 150));
  actionCount += 1;
  return actionCount;
}

export async function getCount() {
  return actionCount;
}
