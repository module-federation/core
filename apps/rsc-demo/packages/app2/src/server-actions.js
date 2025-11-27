'use server';

let actionCount = 0;

export async function incrementCount() {
  actionCount += 1;
  return actionCount;
}

export function getCount() {
  return actionCount;
}
