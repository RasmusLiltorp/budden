import { shortId } from '@budden/shared';

export const fmtId = (id: string): string => shortId(id);

export const fmtDate = (d: Date): string => d.toISOString().slice(0, 10);

export const fmtDateTime = (d: Date): string => {
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return `${date} ${time}`;
};
