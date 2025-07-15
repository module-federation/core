import { McpServerMetadata } from '../../host/src/types';

export const filesystemMetadata: McpServerMetadata = {
  name: 'filesystem',
  version: '1.0.0',
  description: 'File system operations for MCP',
  author: 'Module Federation Team',
  capabilities: {
    tools: ['read_file', 'write_file', 'list_directory'],
  },
};

export const toolsMetadata: McpServerMetadata = {
  name: 'tools',
  version: '1.0.0',
  description: 'System and process information tools',
  author: 'Module Federation Team',
  capabilities: {
    tools: ['process_info', 'system_info'],
  },
};
