const { URL } = require('url');
const debug = require('debug')('API:Session')
const http = require('https')

const openSession = function(url, user, pass) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    url = new URL(url)
    const opts = {
      "protocol":"https:",
      "hostname":url.hostname,
      "port":443,
      "path":url.pathname,
      "method":"POST",
      "headers": {
        'Content-Type':"application/json;charset=UTF-8"
      }
    }

    debug(opts)

    const request = http.request(opts, (response) => {
      debug('Response returned, status %s', response.statusCode)
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to post to login, status code: ' + response.statusCode));
      }

      const cookies = response.headers['set-cookie']

      // Discard the response
      response.on('data', (chunk) => true );
      response.on('end', () => resolve({
        "hostname": url.hostname,
        "cookies": cookies.map( c=> c.split(';')[0]).join('; ')
      }));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))

    const creds = {
      "username":user,
      "password":pass,
      "keep_me_logged_in":true
    }


    request.write(JSON.stringify(creds))
    request.end()
  })
};

const closeSession = function(session) {
  return new Promise((resolve, reject) => {
    const opts = {
      "protocol":"https:",
      "hostname": session.hostname,
      "port":443,
      "path": '/logout.php',
      "method":"GET",
      "headers": {
        'Content-Type':"application/json;charset=UTF-8",
        'Cookie':session.cookies
      }
    }

    debug(opts)

    const request = http.request(opts, (response) => {
      debug('Response returned, status %s', response.statusCode)
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 399) {
         reject(new Error('Failed to logout, status code: ' + response.statusCode));
      }

      // Discard the response
      response.on('data', (chunk) => true )
      response.on('end', () => resolve())
    })
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end()
  })
}

module.exports.openSession = openSession
module.exports.closeSession = closeSession
