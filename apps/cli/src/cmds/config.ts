import { configPath, getValue, loadConfig, saveConfig, setValue } from '@budden/config';
import { Command } from 'commander';
import { fail, isJson, ok, printJson } from '../util';

export const configCmd = new Command('config').description('Get/set Budden config values');

configCmd
  .command('get')
  .argument('<key>', 'config key (e.g. db.path)')
  .action((key: string) => {
    const cfg = loadConfig();
    const v = getValue(cfg, key);
    if (v === undefined) fail(`unknown key: ${key}`);
    if (isJson()) printJson({ [key]: v });
    else console.log(v);
  });

configCmd
  .command('set')
  .argument('<key>', 'config key')
  .argument('<value>', 'config value')
  .action((key: string, value: string) => {
    const cfg = loadConfig();
    const next = setValue(cfg, key, value);
    saveConfig(next, configPath());
    ok(`Set ${key} = ${value}`);
  });
