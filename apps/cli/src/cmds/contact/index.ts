import { Command } from 'commander';
import { addCmd } from './add';
import { assignCmd } from './assign';
import { channelCmd } from './channel';
import { lsCmd } from './ls';
import { showCmd } from './show';

export const contactCmd = new Command('contact').description('Manage contacts');
contactCmd.addCommand(addCmd);
contactCmd.addCommand(lsCmd);
contactCmd.addCommand(showCmd);
contactCmd.addCommand(assignCmd);
contactCmd.addCommand(channelCmd);
