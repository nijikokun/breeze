var breeze = require('../breeze')

// Helpers
var noop = function () {}

// Generic failure promise
var ErrorPromise = {
  then: function () {
    return {
      catch: function (next) {
        next(':(')
      }
    }
  },
  catch: function (next) {
    next(':(')
  }
}

// Generic successful promise.
var SuccessPromise = {
  then: function (next) {
    next(':)')
    return { catch: noop }
  },
  catch: noop
}

// Old Generic successful promise
var OldSuccessPromise = {
  then: function (success, error) {
    success(':)')
  }
}

// Initialize flow system
//
// Here we return our promise directly, since promises have their own error / success system we let
// breeze determine the path from the promise results.
//
// Swap out `SuccessPromise` for `ErrorPromise` if you want to see a sad-face.
// Swap out `SuccessPromise` for `OldSuccessPromise` if you want to see breeze recognize older promise style.
var flow = breeze(function (next) {
  next(SuccessPromise, ';^)')
})

// When promise is successful
flow.then(function (next, passedValue, promiseValue) {
  console.log('Passed values should come first ";^)":', passedValue)
  console.log('Promise should pass with ":)":', promiseValue)
})

// When promise fails
flow.catch(function (err) {
  console.log('Promise should fail with ":(":', err)
})
