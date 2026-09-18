import { Store } from '../src/core/store'

interface Row {
  id: string
  label: string
}

describe('Store', () => {
  test('generates sequential ids starting at "1"', () => {
    const store = new Store<Row>()
    expect(store.nextId()).toBe('1')
    expect(store.nextId()).toBe('2')
    expect(store.nextId()).toBe('3')
  })

  test('add returns the record and grows size', () => {
    const store = new Store<Row>()
    expect(store.size).toBe(0)
    const row = store.add({ id: '1', label: 'a' })
    expect(row).toEqual({ id: '1', label: 'a' })
    expect(store.size).toBe(1)
  })

  test('all returns a copy that cannot mutate internal state', () => {
    const store = new Store<Row>()
    store.add({ id: '1', label: 'a' })

    const snapshot = store.all()
    snapshot.push({ id: '2', label: 'injected' })

    expect(store.size).toBe(1)
    expect(store.all()).toHaveLength(1)
  })

  test('filter selects matching records', () => {
    const store = new Store<Row>()
    store.add({ id: '1', label: 'keep' })
    store.add({ id: '2', label: 'drop' })
    store.add({ id: '3', label: 'keep' })

    const kept = store.filter((r) => r.label === 'keep')
    expect(kept.map((r) => r.id)).toEqual(['1', '3'])
  })

  test('findById returns the record or undefined', () => {
    const store = new Store<Row>()
    store.add({ id: '1', label: 'a' })

    expect(store.findById('1')?.label).toBe('a')
    expect(store.findById('999')).toBeUndefined()
  })
})
