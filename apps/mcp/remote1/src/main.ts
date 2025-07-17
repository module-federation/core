import { createFilesystemServer } from './filesystem-server';
import { createToolsServer } from './tools-server';

console.log('MCP Remote1 - Filesystem and Tools Server');

// Export servers for Module Federation
export { createFilesystemServer, createToolsServer };

// For local testing
if (require.main === module) {
  console.log('Running MCP Remote1 servers locally...');
  const fsServer = createFilesystemServer();
  const toolsServer = createToolsServer();

  console.log('Filesystem server created');
  console.log('Tools server created');
}
