'use server';

let sharedCounter = 0;

export async function incrementSharedCounter() {
  sharedCounter += 1;
  return sharedCounter;
}

export function getSharedCounter() {
  return sharedCounter;
}
