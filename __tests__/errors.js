
const { PassThrough } = require('stream')
const assert = require('assert')

const { streamToString } = require('../utils')
const render = require('../lib')

test('a number should throw', async () => {
  try {
    await streamToString(render`1${2}3`)
  } catch (err) {
    assert(/value passed/i.test(err.message))
    return
  }
  throw new Error('boom')
})

test('a sync function error should be caught and thrown in the stream', async () => {
  const fn = () => { throw new Error('boom') }
  const errors = []
  const stream = render`1${fn}2`
  stream.on('error', err => errors.push(err))
  const result = await streamToString(stream, false)
  assert.strictEqual(result, '12')
  expect(result).toMatchSnapshot()
  assert.strictEqual(errors.length, 1)
  assert.strictEqual(errors[0].message, 'boom')
})

test('a stream error should be forwarded', async () => {
  const src = new PassThrough()

  const errors = []
  const stream = render`1${src}3`
  stream.on('error', err => errors.push(err))

  setImmediate(() => {
    src.write('2')
    src.emit('error', new Error('boom'))
    src.destroy()
  })

  const result = await streamToString(stream, false)
  assert.strictEqual(result, '123')
  expect(result).toMatchSnapshot()
  assert.strictEqual(errors.length, 1)
  assert.strictEqual(errors[0].message, 'boom')
})

test('should throw if an object stream is passed', async () => {
  const src = new PassThrough({ objectMode: true })

  const errors = []
  const stream = render`1${src}3`
  stream.on('error', err => errors.push(err))

  setImmediate(() => {
    src.write('2')
    src.end()
  })

  const result = await streamToString(stream, false)
  assert.strictEqual(result, '13')
  expect(result).toMatchSnapshot()
  assert.strictEqual(errors.length, 1)
  assert(/object/i.test(errors[0].message))
})
