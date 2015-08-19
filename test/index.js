var assert = require('assert')
var breeze = require('../breeze')
var http = require('http')

describe('breeze', function () {
  it('should return a promise style object', function () {
    var promise = breeze()
    assert(typeof promise.then === 'function')
    assert(typeof promise.catch === 'function')
  })

  it('should support an initial then', function () {
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

  it('should support then chaining', function () {
    var fixture = 'value'

    breeze().then(function (next) {
      return next(null, fixture)
    }).then(function (next, value) {
      assert(value === fixture)
    })
  })

  it('should properly catch errors', function () {
    var fixture = new Error('Simply testing.')

    breeze().then(function (next) {
      return next(fixture)
    }).catch(function (err) {
      assert(err === fixture)
    })
  })

  it('should choose the proper road when using maybe', function () {
    var route = 'A'
    var fixtureA = 'hello'
    var fixtureB = 'world'

    breeze()
    .maybe(route === 'A', function (next) {
      return next(null, fixtureA)
    })
    .maybe(function () {
      route === 'B'
    }, function (next) {
      return next(null, fixtureB)
    })
    .then(function (next, value) {
      assert(value === fixtureA)
    })
    .catch(function (err) {
      assert(false)
    })
  })

  it('should choose none when no some match', function () {
    var someA = false
    var someB = false
    var fixtureA = 'hello'
    var fixtureB = 'world'
    var fixtureC = 'tekken'

    breeze()
    .some(someA, function (next) {
      return next(null, fixtureA)
    })
    .some(someB, function (next) {
      return next(null, fixtureB)
    })
    .none(function (next) {
      return next(null, fixtureC)
    })
    .then(function (next, value) {
      assert(value === fixtureC)
    })
    .catch(function (err) {
      assert(false)
    })
  })

  it('should choose some when some has matched', function () {
    var someA = true
    var someB = false
    var fixtureA = 'hello'
    var fixtureB = 'world'
    var fixtureC = 'tekken'

    breeze()
    .some(someA, function (next) {
      return next(null, fixtureA)
    })
    .some(someB, function (next) {
      return next(null, fixtureB)
    })
    .none(function (next) {
      return next(null, fixtureC)
    })
    .then(function (next, value) {
      assert(value === fixtureA)
    })
    .catch(function (err) {
      assert(false)
    })
  })

  it('should support check methods', function () {
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

  it('should properly chain when async is involved', function (done) {
    var flow = breeze(function (next) {
      var request = http.request({
        hostname: 'httpbin.org',
        port: 80,
        path: '/get',
        method: 'GET'
      }, function (res) {
        next(null, res)
      })

      request.on('error', next)
      request.end()
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

  it('should properly handle try/catch promise success', function (done) {
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

  it('should properly handle try/catch promise error', function (done) {
    var fixture = 'hello world'
    var noop = function (next) {
      next(fixture)
    }
    var promise = {
      then: function () {
        return {
          catch: noop
        }
      },
      catch: noop
    }

    breeze(function (next) {
      next(promise)
    }).then(function (next, value) {
      assert(false)
    }).catch(function (err) {
      assert(err === fixture)
      done()
    })
  })

  it('should properly handle directly passed values w/ promise', function (done) {
    var fixture = 'hello world'
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

    breeze(function (next) {
      next(promise, 'testing')
    }).then(function (next, passedValue, promiseValue) {
      assert(passedValue === 'testing')
      assert(promiseValue === fixture)
      done()
    }).catch(function (err) {
      assert(false)
    })
  })

  it('should properly success through returned promise', function (done) {
    var fixture = 'hello world'

    var flow = breeze(function (next) {
      next(null, 'testing')
    })

    var promise = flow.promise()

    promise.then(function (value) {
      assert(value === 'testing')
      done()
    }).catch(function (err) {
      assert(false)
    })
  })
})
