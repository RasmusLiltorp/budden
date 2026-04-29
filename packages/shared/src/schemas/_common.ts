import { z } from 'zod';

export const Json = z.record(z.string(), z.unknown()).nullable();
export type Json = z.infer<typeof Json>;
