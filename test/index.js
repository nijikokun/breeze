var tess = require('tess')
var assert = require('assert')
var breeze = require('../breeze')

tess('breeze', function (it) {
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
    .maybe(route === 'B', function (next) {
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

  it('should choose some when no some has matched', function () {
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
})
