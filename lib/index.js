
const { PassThrough } = require('stream')

module.exports = render

function render (strings, ...values) {
  const stream = new PassThrough()
  setImmediate(run)
  return stream

  async function run () {
    for (let i = 0; i < strings.length; i++) {
      if (strings[i]) stream.write(strings[i])

      let value = values[i]
      if (!value) continue

      if (typeof value === 'function') {
        try {
          value = value()
        } catch (err) {
          onError(err)
          continue
        }
      }

      try {
        const result = await Promise.resolve(value)
        if (!result) continue
        else if (typeof result === 'string') stream.write(result)
        else if (result.readableObjectMode) throw new Error('Readable object streams are not supported.')
        else if (result.readable) await pipe(result)
        else throw new Error(`Value passed did not return a string or a stream: <${typeof result}>${JSON.stringify(result)}`)
      } catch (err) {
        onError(err)
        continue
      }

      await new Promise(setImmediate)
    }

    stream.end()
  }

  function pipe (readable) {
    return new Promise((resolve, reject) => {
      readable
        .on('error', reject)
        .on('end', resolve)
        .pipe(stream, {
          end: false
        })
    })
  }

  function onError (err) {
    stream.emit('error', err)
  }
}
