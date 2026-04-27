import { z } from 'zod';

export const Json = z.record(z.unknown()).nullable();
export type Json = z.infer<typeof Json>;
