const Session = require('./session')
const debug = require('debug')('API:Event')
const http = require('https')
const _ = require('lodash')
const { DateTime } = require('luxon')

const getEvent = function(session, id) {
  return new Promise((resolve, reject) => {
    const opts = {
      "protocol":"https:",
      "hostname": session.hostname,
      "port":443,
      "path": `/api/events/${id}`,
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

const jsonToForm = function(json) {
  var parts = []

  const enc = function(name, path) {
    var value = _.get(json,path)
    if (value) {
      parts.push( name + '=' + encodeURIComponent(value) )
    }
  }

  parts.push('ax=create')
  enc('model[groupId]','group.id')
  enc('model[name]','name')
  enc('model[attendEstQuantity]','estimated_attendance')
  enc('model[description]','description')
  enc('model[ownerId]','owner.id')

  var start = DateTime.fromISO(json.start, { zone: 'America/Chicago' })
  var end = DateTime.fromISO(json.end, { zone: 'America/Chicago' })
  var setup = DateTime.fromISO(json.setup, { zone: 'America/Chicago' })
  var cleanup = DateTime.fromISO(json.cleanup, { zone: 'America/Chicago' })

  if (start.isValid) { parts.push('model[selectedDate]=' + encodeURIComponent(start.toFormat('M/d/yyyy'))) }
  if (start.isValid) { parts.push('model[startTime]=' + encodeURIComponent(start.TIME_SIMPLE)) }
  if (end.isValid)   { parts.push('model[endTime]=' + encodeURIComponent(end.TIME_SIMPLE)) }

  if (start.isValid && setup.isValid) {
    parts.push('model[setupMinutes]=' + start.diff(setup, 'minutes'))
  } else {
    parts.push('model[setupMinutes]=0')
  }

  if (end.isValid && cleanup.isValid) {
    parts.push('model[cleanupMinutes]=' + cleanup.diff(end, 'minutes'))
  } else {
    parts.push('model[cleanupMinutes]=0')
  }

  return parts.join('&')
}

const setEvent = function(session, json) {
  return new Promise((resolve, reject) => {
    const opts = {
      "protocol":"https:",
      "hostname": session.hostname,
      "port":443,
      "path": `/service/event.php`,
      "method":"POST",
      "headers": {
        "Content-Type":"application/x-www-form-urlencoded",
        "Accept":"application/json",
        "Cookie": session.cookies
      }
    }

    debug(opts)

    const request = http.request(opts, (response) => {
      debug('Event write returned, status %s', response.statusCode)
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to set event, status code: ' + response.statusCode));
      }

      response.on('data', (chunk) => null );
      response.on('end', () => resolve(response.statusCode));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end(jsonToForm(json))
  })
}

module.exports.getEvent = getEvent
module.exports.jsonToForm = jsonToForm // temp
modele.exports.setEvent = setEvent
