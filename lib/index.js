
const { PassThrough } = require('stream')

module.exports = render

function render (template, ...values) {
  const stream = new PassThrough()
  const length = template.length
  let i = 0
  next()
  return stream

  function next () {
    stream.write(template[i])

    if (i === length - 1) {
      stream.end()
      return
    }

    const value = values[i++]
    Promise.resolve(typeof value === 'function' ? value() : value).then((result) => {
      if (typeof result === 'string') return stream.write(result)
      if (result.readableObjectMode) throw new Error('Readable object streams are not supported.')
      if (result.readable) return pipe(result)
      throw new Error(`Value passed did not return a string or a stream: <${typeof value}>${JSON.stringify(value)}`)
    }, onError).finally(next)
  }

  function pipe (readable) {
    return new Promise((resolve, reject) => {
      result.pipe(stream, {
        end: false
      })
      result.on('error', err => reject(err))
      result.on('end', () => resolve())
    })
  }

  function onError (err) {
    stream.emit('error', err)
  }
}
