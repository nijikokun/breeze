var assert = require('assert')
var breeze = require('../breeze')

describe('breeze', function () {
  it('breeze(): returns deferred', function () {
    var promise = breeze()
    assert(typeof promise.then === 'function')
    assert(typeof promise.catch === 'function')
  })

  it('breeze(): supports then method as first argument', function () {
    breeze(function (next) {
      assert(typeof next === 'function')
      next(null, 'passed')
    })
    .then(function (next, value) {
      assert(value === 'passed')
    })
    .catch(function (err) {
      assert(false)
    })
  })

  it('then(): should properly continue on previous step success', function () {
    var fixture = 'value'

    breeze().then(function (next) {
      return next(null, fixture)
    }).then(function (next, value) {
      assert(value === fixture)
    })
  })

  it('catch(): should be invoked when an error occurs', function () {
    var fixture = new Error('Simply testing.')
    var flow = breeze()

    flow.then(function (next) {
      return next(fixture)
    })

    flow.catch(function (err) {
      assert(err === fixture)
    })
  })

  it('maybe(): should invoke second argument when match passes', function () {
    var route = 'A'
    var fixtureA = 'hello'
    var fixtureB = 'world'
    var flow = breeze()

    flow.maybe(route === 'A', function (next) {
      return next(null, fixtureA)
    })

    flow.maybe(function () {
      route === 'B'
    }, function (next) {
      return next(null, fixtureB)
    })

    flow.then(function (next, value) {
      assert(value === fixtureA)
    })

    flow.catch(function (err) {
      assert(false)
    })
  })

  it('none(): should be invoked when no match is successful', function () {
    var someA = false
    var someB = false
    var fixtureA = 'hello'
    var fixtureB = 'world'
    var fixtureC = 'tekken'
    var flow = breeze()

    flow.some(someA, function (next) {
      return next(null, fixtureA)
    })

    flow.some(someB, function (next) {
      return next(null, fixtureB)
    })

    flow.none(function (next) {
      return next(null, fixtureC)
    })

    flow.then(function (next, value) {
      assert(value === fixtureC)
    })

    flow.catch(function (err) {
      assert(false)
    })
  })

  it('some(): should invoke when match is successful', function () {
    var someA = true
    var someB = false
    var fixtureA = 'hello'
    var fixtureB = 'world'
    var fixtureC = 'tekken'
    var flow = breeze()

    flow.some(someA, function (next) {
      return next(null, fixtureA)
    })

    flow.some(someB, function (next) {
      return next(null, fixtureB)
    })

    flow.none(function (next) {
      return next(null, fixtureC)
    })

    flow.then(function (next, value) {
      assert(value === fixtureA)
    })

    flow.catch(function (err) {
      assert(false)
    })
  })

  it('when(): properly handles check method success result', function () {
    var check = function (value) {
      return value === 'passed'
    }

    breeze(function (next) {
      assert(typeof next === 'function')
      next(null, 'passed')
    })
    .when(check, function (next, value) {
      assert(value === 'passed')
      next(null, 'through')
    })
    .then(function (next, value) {
      assert(value === 'through')
    })
    .catch(function (err) {
      assert(false)
    })
  })

  it('when(): supports async values from previous step as arguments for check method', function (done) {
    var flow = breeze()

    flow.then(function (next) {
      setTimeout(function () {
        next(null, {
          statusCode: 200
        })
      }, 0)
    })

    flow.when(function (response) {
      return response.statusCode === 200
    }, function (next, response) {
      assert(typeof response === 'object')
      done()
    })

    flow.catch(function (err) {
      assert(false)
      done()
    })
  })

  it('next(): supports promise success when promise is passed as first argument', function (done) {
    var noop = function () {}
    var fixture = 'hello world'
    var promise = {
      then: function (next) {
        next(fixture)
        return { catch: noop }
      },
      catch: noop
    }

    breeze(function (next) {
      next(promise)
    }).then(function (next, value) {
      assert(value === fixture)
      done()
    })
  })

  it('next(): supports promise error when promise is passed as first argument', function (done) {
    var fixture = 'hello world'
    var flow = breeze()
    var noop = function (next) { next(fixture) }

    var promise = {
      then: function () {
        return {
          catch: noop
        }
      },
      catch: noop
    }

    flow.then(function (next) {
      next(promise)
    })

    flow.then(function (next, value) {
      assert(false)
    })

    flow.catch(function (err) {
      assert(err === fixture)
      done()
    })
  })

  it('then(): supports sending additional arguments with promise as first argument', function (done) {
    var fixture = 'hello world'
    var flow = breeze()
    var noop = function () {}

    var promise = {
      then: function (next) {
        next(fixture)
        return {
          catch: noop
        }
      },
      catch: noop
    }

    flow.then(function (next) {
      next(promise, 'testing')
    })

    flow.then(function (next, passedValue, promiseValue) {
      assert(passedValue === 'testing')
      assert(promiseValue === fixture)
      done()
    })

    flow.catch(function (err) {
      assert(false)
    })
  })

  it('deferred(): should properly send success to then()', function (done) {
    var fixture = 'hello world'
    var flow = breeze()
    var promise = flow.deferred()

    flow.then(function (next) {
      next(null, 'testing')
    })

    promise.then(function (value) {
      assert(value === 'testing')
      done()
    })

    promise.catch(function (err) {
      assert(false)
    })
  })

  it('deferred(): should properly send errors to catch()', function (done) {
    var fixture = 'hello world'
    var flow = breeze()
    var promise = flow.deferred()

    flow.then(function (next) {
      return next('testing')
    })

    promise.then(function (value) {
      return assert(false)
    })

    promise.catch(function (err) {
      assert(err === 'testing')
      return done()
    })
  })

  it('pass(): properly introduce variables into flow', function (done) {
    var flow = breeze()

    flow.pass('first')
    flow.pass('second')
    flow.then(function (next, a, b) {
      assert(a === 'first')
      assert(b === 'second')
      return done()
    })
    flow.catch(function (error) {
      assert(false)
    })
  })

  it('each(): properly iterate and apply logic to referenced array values', function (done) {
    var flow = breeze()
    var fixture = [1, 2, 3]

    flow.pass(fixture)

    flow.each(function (iterables) {
      return iterables
    }, function (value, index, next) {
      return next(null, value * 3)
    })

    flow.then(function (next, iterables) {
      assert(iterables[0] === 3)
      assert(iterables[1] === 6)
      assert(iterables[2] === 9)
      return done()
    })

    flow.catch(function (error) {
      assert(false)
    })
  })
})
