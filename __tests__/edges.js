
const assert = require('assert')

const { streamToString } = require('../utils')
const render = require('../lib')

test('values at the edges', async () => {
  const result = await streamToString(render`${'1'}test${'2'}`)
  assert.strictEqual(result, '1test2')
  expect(result).toMatchSnapshot()
})
