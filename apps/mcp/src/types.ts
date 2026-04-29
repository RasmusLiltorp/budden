import type { DB } from '@budden/core';
import type { ZodRawShape, z } from 'zod';

export type ToolContext = { db: DB };

export type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
};

export type Tool<Shape extends ZodRawShape = ZodRawShape> = {
  name: string;
  description: string;
  inputSchema: Shape;
  handler: (args: z.infer<z.ZodObject<Shape>>, ctx: ToolContext) => ToolResult;
};

export const ok = (data: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  structuredContent:
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : { value: data },
});

export const err = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});
