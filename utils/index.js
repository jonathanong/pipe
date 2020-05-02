
exports.streamToString = (x, errorHandler = true) => new Promise((resolve, reject) => {
  let buf = ''
  x.setEncoding('utf8')
  x.on('data', chunk => { buf += chunk })
  if (errorHandler) x.on('error', err => reject(err))
  x.on('end', () => resolve(buf))
})
