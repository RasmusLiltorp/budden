export const now = (): Date => new Date();

export const daysAgo = (n: number, from: Date = new Date()): Date => {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

export const daysBetween = (a: Date, b: Date): number => {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const parseOccurredAt = (input: string | undefined): Date => {
  if (!input) return now();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`invalid date: ${input}`);
  }
  return d;
};
