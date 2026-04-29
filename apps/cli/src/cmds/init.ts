import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { configPath, loadConfig, saveConfig } from '@budden/config';
import { Command } from 'commander';
import { initDb } from '../db';
import { ok } from '../util';

export const initCmd = new Command('init')
  .description('Initialise the Budden database and config')
  .action(() => {
    const cfgFile = configPath();
    const cfg = loadConfig();
    if (!existsSync(cfgFile)) {
      cfg.server.token = randomBytes(24).toString('hex');
      saveConfig(cfg, cfgFile);
      ok(`Wrote config to ${cfgFile}`);
      console.log(
        `\n  API token (save this — it will not be shown again):\n  ${cfg.server.token}\n`,
      );
    } else {
      ok(`Config already exists at ${cfgFile}`);
    }
    const db = initDb();
    ok(`Database ready at ${cfg.db.path}`);
    db.$client.close();
  });
