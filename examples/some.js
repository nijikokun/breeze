var breeze = require('../breeze.js')
var match = 3

// Create a flow system, inside we return the match value to show
// how you can utilize some checks in two ways.
var flow = breeze(function (next) {
  setTimeout(function () {
    next(null, match)
  }, 80)
})

// We can use breeze like normal, and detached even though we have created a variable from it.
// Match is obviously not one, this will never be invoked.
flow.some(match === 1, function (next, value) {
  console.log('1', value)
})

// Unlike the first some, this some check takes a function which is only ran after a next is invoked
flow.some(function (value) {
  console.log('checking', value)
  return value === 3
}, function (next, value) {
  console.log('2', value)
  next(null, 'passed')
})

// Since the previous matched, this will not ever be ran, or tested.
flow.some(match === 3, function (next, value) {
  console.log('3', value)
  next('race condition has occurred')
})

// Finally our none, when none of the some checks are truthful, this method will be invoked.
flow.none(function (next, value) {
  console.log('none', value)
  next('none should not have been invoked!')
})

// Finally, we arrive at the end of the chain. next is a required argument, but you don't have to use it.
// It will do nothing at this point, unless you invoke an error.
flow.then(function (next, value) {
  console.log('output should be "passed":', value)
})

// Errors occurred
flow.catch(function (err) {
  console.log('An error has occurred:', err)
})
