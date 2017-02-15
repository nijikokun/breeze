const BreezeHelpers = require('./BreezeHelpers')
const BreezeCallable = require('./BreezeCallable')

class Breeze {
  constructor () {
    this.tree = []
    this.promise = Promise.resolve()
    this.skipAmount = false
    this.skipIdentifiers = []
  }

  toSkippableCallable (callable) {
    return (args) => {
      if (this.skipAmount > 0) {
        callable.skipped = true
        this.skipAmount -= 1
        return args
      }

      return callable.method(args)
    }
  }

  add (callable) {
    this.tree.push(callable)
    this.promise = this.promise.then(this.toSkippableCallable(callable))
    return this
  }

  addCallable (type, method, conditional) {
    return this.add(new BreezeCallable({ type: type, method: method, conditional: conditional }))
  }

  id (name) {
    let entry = this.tree[this.tree.length - 1]
    if (entry) entry.id = name
    return this
  }

  skip (amount) {
    this.skipAmount += amount
    return this
  }

  all (promises) {
    return this.addCallable('all', Promise.all(promises))
  }

  get (index) {
    return this.addCallable('get', (args) => args[index > 0 ? index : args.length - 1])
  }

  tap (method) {
    return this.addCallable('tap', (args) => { method(args); return args })
  }

  when (conditional, method) {
    return this.addCallable('when', method, conditional)
  }

  then (method) {
    return this.addCallable('then', method)
  }

  spread (method) {
    return this.addCallable('spread', (args) => method.apply(this, args))
  }

  return (value) {
    return this.addCallable('return', BreezeHelpers.toConditional(value))
  }

  throw (reason) {
    return this.addCallable('throw', BreezeHelpers.toConditional(reason))
  }

  map (promises) {
    let map = []
    return this.each(promises, result => map.push(result) && [].concat(map))
  }

  catch () {
    let callable = new BreezeCallable({ type: 'catch' })

    if (!arguments[1]) {
      callable.setMethod(arguments[0])
    } else {
      callable.setMethod(e => {
        if (e instanceof arguments[0]) {
          return arguments[1].call(this, e)
        }
      })
    }

    this.tree.push(callable)
    this.promise = this.promise.catch(callable.method)

    return this
  }

  each (promises, callable) {
    promises.forEach(promise => {
      return this
        .add(new BreezeCallable({ type: 'each', method: promise }))
        .add(new BreezeCallable({ type: 'each-then', method: callable }))
    })

    return this
  }
}

module.exports = Breeze
