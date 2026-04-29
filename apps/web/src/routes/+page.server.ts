import { getFollowupQueue, getInbox, getTodayQueue, listLists } from '@budden/core';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  const d = db();
  const lists = listLists(d);
  const overview = lists.map((list) => ({
    list,
    today: getTodayQueue(d, list.id).length,
    followups: getFollowupQueue(d, list.id).length,
    inbox: getInbox(d, list.id).length,
  }));
  return { overview };
};
