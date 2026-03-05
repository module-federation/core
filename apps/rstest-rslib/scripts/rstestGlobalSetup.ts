import { cleanupDemoServers, ensureDemoServers } from './server.setup';

export async function setup() {
  await ensureDemoServers();
}

export async function teardown() {
  await cleanupDemoServers();
}
