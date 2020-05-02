# @jongleberry/pipe

Streaming server template. 
Define variables or sections as promises or streams or thunks that return either in your template,
and they will be evaluated at render time.

Example:

```js
const render = function ({
  getCurrentUser
}) {
  const currentUser = getCurrentUser
  return pipe`
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        ${async () => React.renderToNodeStream(React.createElement(App, {
          currentUser: await currentUser,
        }))}
        <script>window.__INITIAL_STATE__ = ${async () => JSON.stringify({
          currentUser: await currentUser,
        })}
        <script src="entrypoint.js"></script>
      </body>
    </html>
  `
}

// express middleware
function (req, res) {
  res.setHeader('content-type', 'text/html; charset=utf-8)
  render({
    getCurrentUser: services.getCurrentUser(req)
  }).pipe(res)
}
```

Variable types:

- `<String>` - serialize anything that isn't a string yourself as this library will throw.
- `Promise<String>` - a promise that returns a string.
- `Stream` - a binary stream that will be pipe directly into the response. This library does not check its contents, but object streams will throw: pipe it into a stream such as [streaming-json-stringify](https://www.npmjs.com/package/streaming-json-stringify).
- A function or async function that returns any of the above.

## Error Handling

Since the status code should be flushed before rendering even begins, we can't properly send status codes.
Thus, this library doesn't handle errors in the templates as there's not much it can do - you should handle those yourself.
