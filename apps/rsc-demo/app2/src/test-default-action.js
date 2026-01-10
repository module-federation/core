'use server';

// Test server action with default export to verify P1 bug fix
export default async function testDefaultAction(value) {
  return { received: value, timestamp: Date.now() };
}
