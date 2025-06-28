// Type declarations for MCP SDK
declare module '@modelcontextprotocol/sdk/server' {
  export class Server {
    constructor(info: any, capabilities: any);
    setRequestHandler(schema: any, handler: any): void;
    request(req: any): Promise<any>;
  }
}

declare module '@modelcontextprotocol/sdk/types' {
  export const CallToolRequestSchema: any;
  export const ListToolsRequestSchema: any;
  export interface Tool {
    name: string;
    description: string;
    inputSchema?: any;
  }
}
