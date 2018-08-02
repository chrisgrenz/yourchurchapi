const Session = require('./session')
const debug = require('debug')('API:Individual')
const http = require('https')

const getIndividual = function(session, id) {
  return new Promise((resolve, reject) => {
    const opts = {
      "protocol":"https:",
      "hostname": session.hostname,
      "port":443,
      "path": `/api/individuals/${id}`,
      "method":"GET",
      "headers": {
        "Accept":"application/json;charset=UTF-8",
        "Cookie": session.cookies
      }
    }

    debug(opts)

    const request = http.request(opts, (response) => {
      debug('Response returned, status %s', response.statusCode)
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to get individual, status code: ' + response.statusCode));
      }

      const body = []
      response.on('data', (chunk) => body.push(chunk) );
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end()
  })
}



module.exports.getIndividual = getIndividual
