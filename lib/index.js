
const { PassThrough } = require('stream')

module.exports = render

function render (template, ...values) {
  const stream = new PassThrough()
  const length = template.length
  let i = 0
  next()
  return stream

  function next () {
    setImmediate(_next)
  }

  function _next () {
    if (template[i]) stream.write(template[i])
    if (i === length - 1) return stream.end()

    let value = values[i++]
    if (typeof value === 'function') {
      try {
        value = value()
      } catch (err) {
        onError(err)
        next()
        return
      }
    }

    Promise.resolve(value).then((result) => {
      if (!result) return
      if (typeof result === 'string') return stream.write(result)
      if (result.readableObjectMode) throw new Error('Readable object streams are not supported.')
      if (result.readable) return pipe(result)
      throw new Error(`Value passed did not return a string or a stream: <${typeof result}>${JSON.stringify(result)}`)
    }).catch(onError).finally(next)
  }

  function pipe (readable) {
    return new Promise((resolve, reject) => {
      readable.pipe(stream, {
        end: false
      })
      readable.on('error', err => reject(err))
      readable.on('end', () => resolve())
    })
  }

  function onError (err) {
    stream.emit('error', err)
  }
}
