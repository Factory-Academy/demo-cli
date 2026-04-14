#!/usr/bin/env node
import { Command } from 'commander'
import { itemCommand } from './commands/item'
import { widgetCommand } from './commands/widget'

const program = new Command()

program
  .name('demo-cli')
  .description('{{PROJECT_DESCRIPTION}}')
  .version('0.1.0')

program.addCommand(itemCommand)
program.addCommand(widgetCommand)

program.parse()
