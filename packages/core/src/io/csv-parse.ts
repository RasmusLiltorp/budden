const parseLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuote = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
};

export const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = parseLine(lines[0]!).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) row[headers[i]!] = (cells[i] ?? '').trim();
    return row;
  });
};

export const csvEscape = (v: string | null | undefined): string => {
  if (v == null) return '';
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
};
