
// const { PassThrough } = require('stream')
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
