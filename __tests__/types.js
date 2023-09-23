
const { PassThrough } = require('stream')
const assert = require('assert')

const { streamToString } = require('../utils')
const render = require('../lib')

test('regular template string', async () => {
  const result = await streamToString(render`test`)
  assert.strictEqual(result, 'test')
  expect(result).toMatchSnapshot()
})

test('a sync promise', async () => {
  const result = await streamToString(render`1${Promise.resolve('2')}3`)
  assert.strictEqual(result, '123')
  expect(result).toMatchSnapshot()
})

test('an async promise', async () => {
  const promise1 = new Promise(resolve => setImmediate(() => resolve('asdf')))
  const promise2 = new Promise(resolve => setImmediate(() => resolve('1234')))

  const result = await streamToString(render`__1__${promise1}__2__${promise2}__3__`)
  assert.strictEqual(result, '__1__asdf__2__1234__3__')
  expect(result).toMatchSnapshot()
})

test('a promise-returning function', async () => {
  const fn = () => new Promise(resolve => setImmediate(() => resolve('asdf')))

  const result = await streamToString(render`__1__${fn}__2__`)
  assert.strictEqual(result, '__1__asdf__2__')
  expect(result).toMatchSnapshot()
})

test('an async function', async () => {
  const fn = async () => {
    await new Promise(resolve => setImmediate(resolve))
    return 'asdf'
  }

  const result = await streamToString(render`__1__${fn}__2__`)
  assert.strictEqual(result, '__1__asdf__2__')
  expect(result).toMatchSnapshot()
})

test('a stream', async () => {
  const stream = new PassThrough()
  stream.write('asdf')
  stream.end()

  const result = await streamToString(render`__1__${stream}__2__`)
  assert.strictEqual(result, '__1__asdf__2__')
  expect(result).toMatchSnapshot()
})

test('a null value', async () => {
  const promise1 = new Promise(resolve => setImmediate(() => resolve('')))
  const promise2 = new Promise(resolve => setImmediate(() => resolve(null)))

  const result = await streamToString(render`__1__${promise1}__2__${promise2}__3__`)
  assert.strictEqual(result, '__1____2____3__')
  expect(result).toMatchSnapshot()
})