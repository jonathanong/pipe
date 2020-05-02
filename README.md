# @jongleberry/pipe

Streaming and async template rendering for node.js using template strings.
Define variables or sections as promises or streams or thunks that return either in your template,
and they will be evaluated at render time.

This allows you to create fast, non-blocking server-side rendered applications while minimizing time-to-first-byte for the user.

## Example

```js
const pipe = require('@jongleberry/pipe')

const render = function ({
  currentUser
}) {
  return pipe`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Example</title>
        <link rel='stylesheet' href='entrypoint.css'>
      </head>
      <body>
        ${async () => React.renderToNodeStream(React.createElement(App, {
          currentUser: await currentUser,
        }))}
        <script>window.__INITIAL_STATE__ = ${async () => JSON.stringify({
          currentUser: await currentUser,
        })}
        <script src='entrypoint.js></script>
      </body>
    </html>
  `
}

// express middleware
function (req, res) {
  res.setHeader('content-type', 'text/html; charset=utf-8')
  res.flushheaders()

  render({
    // pass a promise that resolves to the user
    getCurrentUser: services.getCurrentUser(req)
  }).pipe(res)
}
```

## API

### stream = pipe`` || pipe(strings, ...values)

`render` is a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) that returns a [readable PassThrough stream](https://nodejs.org/api/stream.html#stream_class_stream_passthrough).

### Value Types

- `<String>` - serialize anything that isn't a string yourself as this library will throw.
- `Promise<String>` - a promise that returns a string.
- `Stream` - a binary stream that will be pipe directly into the response. This library does not check its contents, but object streams will throw: pipe it into a stream such as [streaming-json-stringify](https://www.npmjs.com/package/streaming-json-stringify).
- A function or async function that returns either of the above.

### Error Handling

Any section of the template that errors will simply not be rendered.
Streams may partially be rendered, so it's advised that you handle stream errors yourself or pass streams that cannot error (e.g. a passthrough stream).
Listen to any errors on the resulting stream, e.g.:

```js
const stream = pipe`<div id="root">${${async () => React.renderToNodeStream(React.createElement(App, { 
  currentUser: await currentUser 
}))}}</div>`
stream.on('error', err => console.error(err.stack))
```

Some frameworks such as Koa automatically handle this when you set the stream as `ctx.body = stream`

Note that because status codes (or should be) flushed to the client before rendering begins, errors in the template cannot affect the response status code.

### Implementation Notes

- You will probably have to set the content type header yourself
- For compression, be sure to use the `zlib.constants.Z_SYNC_FLUSH` flag
- You may want to [`res.flushHeaders()`](https://nodejs.org/api/http.html#http_request_flushheaders)

## Alternatives

- A cleaner version of https://github.com/almost/stream-template
  - `stream-template` recreates a readable stream from scratch whereas this library relies on passthrough streams `.pipe()`
- A simpler API of https://github.com/matthewp/flora 
  - Does not require any other utilities

Please let me know if you are aware of any other ones.
