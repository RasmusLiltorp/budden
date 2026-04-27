import { shortId } from '@budden/shared';

export const isJson = (): boolean => process.argv.includes('--json');

export const printJson = (data: unknown): void => {
  console.log(JSON.stringify(data, null, 2));
};

export const ok = (msg: string): void => {
  if (!isJson()) console.log(`✓ ${msg}`);
};

export function fail(msg: string): never {
  if (isJson()) console.log(JSON.stringify({ error: msg }));
  else console.error(`✗ ${msg}`);
  process.exit(1);
}

export const formatId = (id: string): string => shortId(id);

export const truncate = (s: string | null | undefined, n: number): string => {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};

export const padRight = (s: string, n: number): string =>
  s.length >= n ? s : s + ' '.repeat(n - s.length);
