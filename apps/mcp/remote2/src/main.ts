import { createGitServer } from './git-server';
import { createDatabaseServer } from './database-server';

console.log('MCP Remote2 - Git and Database Server');

// Export servers for Module Federation
export { createGitServer, createDatabaseServer };

// For local testing
if (require.main === module) {
  console.log('Running MCP Remote2 servers locally...');
  const gitServer = createGitServer();
  const dbServer = createDatabaseServer();

  console.log('Git server created');
  console.log('Database server created');
}
