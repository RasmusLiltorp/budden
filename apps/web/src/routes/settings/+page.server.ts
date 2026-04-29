import { randomBytes } from 'node:crypto';
import { configPath, loadConfig, saveConfig } from '@budden/config';
import { redirect } from '@sveltejs/kit';
import { setSession } from '$lib/server/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  const cfg = loadConfig();
  return {
    dbPath: cfg.db.path,
    configPath: configPath(),
    host: cfg.server.host,
    port: cfg.server.port,
  };
};

export const actions: Actions = {
  rotateToken: ({ cookies, url }) => {
    const cfg = loadConfig();
    cfg.server.token = randomBytes(24).toString('hex');
    saveConfig(cfg, configPath());
    setSession(cookies, cfg.server.token, url);
    throw redirect(303, '/settings?rotated=1');
  },
};
