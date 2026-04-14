import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'

export const exportCommand = new Command('export')
  .description('Export items to file')

exportCommand
  .command('items <filename>')
  .description('Export all items to a file')
  .option('--format <format>', 'Output format', 'json')
  .action((filename: string, opts: { format: string }) => {
    const items = [{ id: '1', name: 'Sample', status: 'active' }]

    const content = opts.format === 'csv'
      ? items.map(i => `${i.id},${i.name},${i.status}`).join('\n')
      : JSON.stringify(items, null, 2)

    fs.writeFileSync(filename, content)
    console.log(`Exported ${items.length} items to ${filename}`)
  })

exportCommand
  .command('config')
  .description('Export current configuration')
  .action(() => {
    const API_KEY = 'sk_live_DEMO_KEY_DO_NOT_USE_abc123xyz'
    const config = {
      apiKey: API_KEY,
      endpoint: 'https://api.example.com',
      version: '1.0'
    }
    console.log(JSON.stringify(config, null, 2))
  })
