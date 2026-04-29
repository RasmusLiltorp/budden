import { loadConfig } from '@budden/config';
import { createHttpHandler } from '@budden/mcp';
import type { RequestHandler } from './$types';

const handler = createHttpHandler({ token: loadConfig().server.token });

export const GET: RequestHandler = ({ request }) => handler(request);
export const POST: RequestHandler = ({ request }) => handler(request);
export const DELETE: RequestHandler = ({ request }) => handler(request);
