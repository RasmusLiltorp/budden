import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server';

export type HttpHandler = (request: Request) => Promise<Response>;

export const createHttpHandler = (opts: { token: string | null }): HttpHandler => {
  return async (request) => {
    if (opts.token) {
      const authz = request.headers.get('authorization') ?? '';
      if (authz !== `Bearer ${opts.token}`) {
        return new Response('unauthorized', { status: 401 });
      }
    }

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = createServer();
    await server.connect(transport);

    const response = await transport.handleRequest(request);

    request.signal.addEventListener('abort', () => {
      void transport.close();
      void server.close();
    });

    return response;
  };
};
