var breeze = require('../breeze.js')

// Create a flow system
var flow = breeze(function (next) {
  next(null, 'passed')
})

// Value is passed down the chain
flow.then(function (next, value) {
  console.log('output should be "passed":', value)
})

// Any errors with short-circuit the system and go here.
flow.catch(function (err) {
  console.log('An error has occurred!', err)
})
