const Session = require('../src/session')
const Event = require('../src/event')
const SECRET = require('./secrets')

Session.openSession('https://autumnridgechurch.ccbchurch.com/api/login',SECRET.ccb_web_user,SECRET.ccb_web_pass)
.then( session => {
  return Event.getEvents(session, '5695')
  .then ( event => console.log(event))
  .then ( () => {
    return Session.closeSession(session)
  })
  .catch( err => console.log(err))
})
.then ( () => {
  console.log("DONE")
})
.catch( err => console.log(err))
