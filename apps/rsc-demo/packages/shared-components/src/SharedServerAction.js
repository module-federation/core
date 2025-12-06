'use server';

let sharedCounter = 0;

export async function incrementSharedCounter() {
  sharedCounter++;
  return sharedCounter;
}

export async function getSharedCounter() {
  return sharedCounter;
}

export async function resetSharedCounter() {
  sharedCounter = 0;
  return sharedCounter;
}
