import { db } from '$lib/server/db';
import { exportCsv, findListByPrefix } from '@budden/core';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  const list = findListByPrefix(db(), params.id);
  if (!list) throw error(404, 'list not found');

  const slug = list.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return new Response(exportCsv(db(), list.id), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${slug || 'list'}.csv"`,
    },
  });
};
