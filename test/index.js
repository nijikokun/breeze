var assert = require('assert')
var breeze = require('../breeze')

describe('breeze', function () {
  it('returns deferred', function () {
    var promise = breeze()
    assert(typeof promise.then === 'function')
    assert(typeof promise.catch === 'function')
  })

  it('supports then method as first argument', function (done) {
    breeze(function (next) {
      assert(typeof next === 'function')
      next(null, 'passed')
    })
    .then(function (next, value) {
      assert(value === 'passed')
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })

  it('then(): should properly continue on previous step success', function () {
    var fixture = 'value'
    var flow = breeze()

    flow.then(function (next) {
      return next(null, fixture)
    })

    flow.then(function (next, value) {
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

  it('maybe(): should invoke second argument when match passes', function (done) {
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
      done()
    })

    flow.catch(function (err) {
      done(err)
    })
  })

  it('none(): should be invoked when no match is successful', function (done) {
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
      done()
    })

    flow.catch(function (err) {
      done(err)
    })
  })

  it('some(): should invoke when match is successful', function (done) {
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
      done()
    })

    flow.catch(function (err) {
      done(err)
    })
  })

  it('when(): properly handles check method success result', function (done) {
    var check = function (value) {
      return value === 'passed'
    }

    var flow = breeze(function (next) {
      assert(typeof next === 'function')
      next(null, 'passed')
    })

    flow.when(check, function (next, value) {
      assert(value === 'passed')
      next(null, 'through')
    })

    flow.then(function (next, value) {
      assert(value === 'through')
      done()
    })

    flow.catch(function (err) {
      done(err)
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
      done(err)
    })
  })

  it('next(): sending skip as first argument ignores next step in list', function (done) {
    var flow = breeze()

    flow.then(function (next) {
      next('skip')
    })

    flow.then(function (next) {
      assert(false, 'Skipping next step failed')
      done()
    })

    flow.then(function (next) {
      done()
    })

    flow.catch(function (err) {
      done(err)
    })
  })

  it('next(): skip supports variable number of steps to skip', function (done) {
    var flow = breeze()

    flow.then(function (next) {
      next('skip', 2)
    })

    flow.then(function (next) {
      assert(false, 'Skipping first next step failed')
    })

    flow.then(function (next) {
      console.log('omg2')
      assert(false, 'Skipping second next step failed')
    })

    flow.then(function (next) {
      done()
    })

    flow.catch(function (err) {
      done(err)
    })
  })

  it('next(): supports passing fixtures after skip', function (done) {
    var flow = breeze()
    var fixture = 'hello world and trent'

    flow.then(function (next) {
      next(null, fixture)
    })

    flow.then(function (next, passed) {
      assert(passed === fixture, 'fixture check failed')
      next('skip', 2)
    })

    flow.then(function (next) {
      assert(false, 'Skipping first next step failed')
    })

    flow.then(function (next) {
      assert(false, 'Skipping second next step failed')
    })

    flow.then(function (next, passed) {
      assert(passed === fixture, 'fixture check failed after skipping')
      return done()
    })

    flow.catch(function (err) {
      return done(err)
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

    var flow = breeze(function (next) {
      next(promise)
    })

    flow.then(function (next, value) {
      assert(value === fixture)
      return done()
    })

    flow.catch(function (err) {
      return done(err)
    })
  })

  it('next(): supports promise error when promise is passed as first argument', function (done) {
    var fixture = 'hello world'
    var flow = breeze()

    var noop = function (next) {
      return next(fixture)
    }

    var promise = {
      then: function () {
        return {
          catch: noop
        }
      },
      catch: noop
    }

    flow.then(function (next) {
      return next(promise)
    })

    flow.then(function (next, value) {
      assert(false)
    })

    flow.catch(function (err) {
      assert(err === fixture)
      return done()
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
      return done(err)
    })
  })

  it('deferred(): should properly send success to then()', function (done) {
    var fixture = 'hello world'
    var flow = breeze()
    var promise = flow.deferred()

    flow.then(function (next) {
      next(null, 'testing')
    })

    flow.catch(function (err) {
      return done(err)
    })

    promise.then(function (value) {
      assert(value === 'testing')
      done()
    })

    promise.catch(function (err) {
      return done(err)
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

    flow.catch(function (err) {
      return done(err)
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

    flow.catch(function (err) {
      return done(err)
    })
  })
})
