const Breeze = require('../lib/Breeze')
const assert = require('assert')

const describe = global.describe
const it = global.it

describe('Breeze', function () {
  it('returns promise chain', function () {
    var flow = new Breeze()

    assert(typeof flow.then === 'function')
    assert(typeof flow.catch === 'function')
  })

  it('returns promise helpers', function () {
    var flow = new Breeze()

    assert(typeof flow.id === 'function')
    assert(typeof flow.all === 'function')
    assert(typeof flow.map === 'function')
    assert(typeof flow.get === 'function')
    assert(typeof flow.tap === 'function')
    assert(typeof flow.when === 'function')
    assert(typeof flow.each === 'function')
    assert(typeof flow.spread === 'function')
    assert(typeof flow.return === 'function')
    assert(typeof flow.throw === 'function')
    assert(typeof flow.map === 'function')
  })

  it('passes values through then chain', done => {
    var flow = new Breeze()

    flow.then(() => {
      return true
    })

    flow.then(result => {
      assert(typeof result === 'boolean')
      assert(result === true)
      done()
    })

    flow.catch(done)
  })

  it('properly handles promises in the chain', done => {
    var flow = new Breeze()

    flow.then(new Promise((resolve, reject) => {
      assert(typeof resolve === 'function')
      assert(typeof reject === 'function')
      resolve(true)
    }))

    flow.then(result => {
      assert(typeof result === 'boolean')
      assert(result === true)
      done()
    })

    flow.catch(done)
  })

  it('catches errors thrown in chain', done => {
    var flow = new Breeze()

    flow.then(() => {
      throw new Error('testing')
    })

    flow.then(result => {
      done(new Error('This step should not have ran'))
    })

    flow.catch(e => {
      assert(e instanceof Error)
      assert(e.message === 'testing')
      done()
    })
  })

  it('catches errors in rejected promises', done => {
    var flow = new Breeze()

    flow.then(new Promise((resolve, reject) => {
      reject(new Error('testing'))
    }))

    flow.then(result => {
      done(new Error('This step should not have ran'))
    })

    flow.catch(e => {
      assert(e instanceof Error)
      assert(e.message === 'testing')
      done()
    })
  })

  it('differentiates custom error objects from normal errors', done => {
    var flow = new Breeze()
    var CustomError = function (message) {
      this.name = 'CustomError'
      this.message = message || 'Default Message'
      this.stack = (new Error()).stack
    }

    CustomError.prototype = Object.create(Error.prototype)
    CustomError.prototype.constructor = CustomError

    flow.then(new Promise((resolve, reject) => {
      reject(new CustomError('testing'))
    }))

    flow.then(result => {
      done(new Error('This step should not have ran'))
    })

    flow.catch(CustomError, e => {
      assert(e instanceof CustomError)
      assert(e.message === 'testing')
      done()
    })

    flow.catch(e => {
      done(new Error('Improperly caught custom error object'))
    })
  })
})
