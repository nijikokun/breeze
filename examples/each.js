var breeze = require('../breeze')

// Create the step system.
var flow = breeze()

// Create our iterables fixture
var fixture = [1, 2, 3]

// Introduce our iterables into the system using .pass to introduce
// new values into the system
flow.pass({
  iterables: fixture
})

// Begin our iteration over our iterables, multiplying each
// entry value by 3, and updating the initial object.
flow.each(function (system) {
  return system.iterables
}, function (value, index, next) {
  return next(null, value * 3)
})

// Invoked after each has successfully finished
flow.then(function (next, system) {
  console.log(system.iterables)
})

// Invoked when an error occurs.
flow.catch(function (error) {
  console.log('error:', error)
})