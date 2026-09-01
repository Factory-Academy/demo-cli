import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { featureFlags } from '../utils/featureFlags'
import { schema, string } from '../utils/validation'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const items: Item[] = []
let nextId = 1

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .action((opts) => {
    let filtered = items
    if (opts.status) {
      filtered = items.filter(i => i.status === opts.status)
    }
    if (filtered.length === 0) {
      console.log('No items found.')
      return
    }

    // Feature flag: enhanced output includes description column
    const enhancedOutput = featureFlags.isEnabled('ENHANCED_OUTPUT')
    const columns = enhancedOutput
      ? ['id', 'name', 'description', 'status', 'createdAt']
      : ['id', 'name', 'status', 'createdAt']

    if (enhancedOutput) {
      console.log('🎨 Enhanced output enabled')
    }

    console.log(formatTable(filtered, columns))
  })

itemCommand
  .command('create')
  .description('Create a new item')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action((opts) => {
    // Validate input using schema-lite validators
    const validator = schema()
      .field('name', string().required().minLength(3).maxLength(50).build())
      .field('description', string().maxLength(200).build())

    const result = validator.validate({
      name: opts.name,
      description: opts.description
    })

    if (!result.valid) {
      console.error('Validation failed:')
      result.errors.forEach(err => console.error(`  - ${err.message}`))
      process.exit(1)
    }

    const item: Item = {
      id: String(nextId++),
      name: opts.name,
      description: opts.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action((id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    console.log(JSON.stringify(item, null, 2))
  })
