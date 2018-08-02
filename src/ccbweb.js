const http = require('https')
const debug = require('debug')('API:HTTP')

const request = async function(session, opts, ret = 'body') {
  return new Promise((resolve, reject) => {
    debug(opts)

    const request = http.request(opts, (response) => {
      debug('Server request %s returned status %s', opts.path, response.statusCode)
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 399) {
         reject(new Error(`Failed to ${opts.method} at ${opts.path}, status code ${response.statusCode}`));
      }

      if (ret == 'body') {
        const body = []
        response.on('data', (chunk) => body.push(chunk) );
        response.on('end', () => resolve(body.join('')));
      }
      else if (ret == 'response') {
        const body = []
        response.on('data', (chunk) => body.push(chunk) );
        response.on('end', () => {
          response.body = body.join('')
          resolve(response)
        })
      } else {
        // Discard body
        response.on('data', (chunk) => false );
        response.on('end', () => resolve(response));
      }
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end()
  })
}

module.exports.request = request
