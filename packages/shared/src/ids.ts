import { ulid } from 'ulid';

export const newId = (): string => ulid();

export const shortId = (id: string): string => id.slice(0, 8);

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

export const isFullId = (s: string): boolean => ULID_RE.test(s);
