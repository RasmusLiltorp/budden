import { db } from '$lib/server/db';
import { search } from '@budden/core';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) return { q, results: null };
  return { q, results: search(db(), q) };
};
