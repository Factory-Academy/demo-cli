#!/usr/bin/env node
import { Command } from 'commander'
import { itemCommand } from './commands/item'
import { widgetCommand } from './commands/widget'
import { config } from './config'

const program = new Command()

program
  .name(config.name)
  .description('{{PROJECT_DESCRIPTION}}')
  .version(config.version)

program.addCommand(itemCommand)
program.addCommand(widgetCommand)

program.parse()
