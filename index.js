const Session = require('./src/session')
const Event = require('./src/event')
const Individual = require('./src/individual')

module.exports.openSession = Session.openSession

module.exports.getIndividual = Individual.getIndividual

module.exports.getEvent = Event.getEvent
module.exports.getEvents = Event.getEvents
