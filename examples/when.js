var breeze = require('../breeze.js')

// Create a flow system
var flow = breeze(function (next) {
  next(null, 'passed')
})

// When you want to test scope variables
// Basic truthy checks are accepted
flow.when(1 === 1, function (next, value) {
  next(null, 'transformed')
})

// You can also check passed values within the flow system.
// these are invoked AFTER the previous chain item is invoked.
flow.when(function (value) {
  return value === 'transformed'
}, function (next, value) {
  next(null, 'success')
})

// Value is passed down the chain
flow.then(function (next, value) {
  console.log('output should be "success":', value)
})

// Any errors with short-circuit the system and go here.
flow.catch(function (err) {
  console.log('An error has occurred!', err)
})
