const Session = require('../src/session')
const Individual = require('../src/individual')
const SECRET = require('./secrets')

Session.openSession('https://autumnridgechurch.ccbchurch.com/api/login',SECRET.ccb_web_user,SECRET.ccb_web_pass)
.then( session => {
  return Individual.getIndividual(session, '5722')
  .then ( individual => console.log(individual))
  .then ( () => {
    return Session.closeSession(session)
  })
  .catch( err => console.log(err))
})
.then ( () => {
  console.log("DONE")
})
.catch( err => console.log(err))
