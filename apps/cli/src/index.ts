#!/usr/bin/env bun
import { Command } from 'commander';
import { configCmd } from './cmds/config';
import { contactCmd } from './cmds/contact';
import { initCmd } from './cmds/init';
import { exportCmd, importCmd } from './cmds/io';
import { listCmd } from './cmds/list';
import { logCmd, replyCmd } from './cmds/log';
import { followupsCmd, inboxCmd, todayCmd } from './cmds/queues';
import { serveCmd } from './cmds/serve';
import { statusCmd } from './cmds/status';

const program = new Command()
  .name('budden')
  .description('Self-hosted, AI-native CRM')
  .version('0.0.1')
  .option('--json', 'output JSON');

program.addCommand(initCmd);
program.addCommand(configCmd);
program.addCommand(listCmd);
program.addCommand(contactCmd);
program.addCommand(logCmd);
program.addCommand(replyCmd);
program.addCommand(statusCmd);
program.addCommand(todayCmd);
program.addCommand(followupsCmd);
program.addCommand(inboxCmd);
program.addCommand(importCmd);
program.addCommand(exportCmd);
program.addCommand(serveCmd);

program.parseAsync(process.argv);
