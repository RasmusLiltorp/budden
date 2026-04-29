import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { db } from './db';
import { allTools } from './tools';
import type { ToolContext } from './types';

export const createServer = (): McpServer => {
  const server = new McpServer(
    { name: 'budden', version: '0.0.1' },
    { capabilities: { tools: {} } },
  );

  const ctx: ToolContext = { db: db() };

  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema },
      async (args: Parameters<typeof tool.handler>[0]) => tool.handler(args, ctx),
    );
  }

  return server;
};
