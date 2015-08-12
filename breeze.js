var isPromise = require('is-promise')

/**
 * Breeze Constructor
 *
 * Accepts a then method as the first argument.
 *
 * @param {Function} method initialization method, optional.
 */
function Breeze (method) {
  this.steps = []

  if (typeof method === 'function') {
    this.then(method)
  }
}

/**
 * Takes the next (optional) callback, and generates the done callback to be passed as the first argument.
 *
 * @private
 * @param  {Function} next Next callback in the system to be invoked.
 * @return {Function} Completion callback, first argument is error, subsequent arguments are passed down the chain.
 */
Breeze.prototype.createDoneCallback = function _breezeCreateDoneCallback () {
  var system = this

  return function (err) {
    var context = this

    function handler (err) {
      if (err) {
        if (!system.onError) {
          system.err = err
        } else {
          system.onError(err)
        }

        return (system.steps = [] && system.check())
      }

      var args = Array.prototype.slice.call(arguments, 1)
      system.args = args
      system.context = context
      system.check(true)
    }

    if (isPromise(err)) {
      var success = function () {
        var args = Array.prototype.slice.call(arguments, 0)
        args.unshift(null)
        handler.apply(context, args)
      }

      return typeof err.catch === 'function'
        ? err.then(success).catch(handler)
        : err.then(success, handler)
    }

    return handler.apply(context, arguments)
  }
}

/**
 * Starts the next task to be completed.
 *
 * @private
 * @return {void}
 */
Breeze.prototype.run = function _breezeRun () {
  var args = this.args || []
  var context = this.context || this
  var func = this.steps.shift()
  this.running = true

  if (typeof func === 'function') {
    args.unshift(this.createDoneCallback())
    return func.apply(context, args)
  }

  if (func[0] === 'none') {
    if (!this.hasSomeHappened) {
      this.hasNoneHappened = true
      func = func[1]
      args.unshift(this.createDoneCallback())
      return func.apply(context, args)
    }

    return this.check(true)
  }

  if (func[0] === 'some' && this.hasSomeHappened) {
    return this.check(true)
  }

  if ((typeof func[1] === 'function' && func[1].apply(this.context, args)) || func[1]) {
    switch (func[0]) {
      case 'when': this.hasWhenHappened = true; break;
      case 'some': this.hasSomeHappened = true; break;
    }

    func = func[2]
    args.unshift(this.createDoneCallback())
    func.apply(context, args)
  } else {
    return this.check(true)
  }
}

/**
 * Checks whether the system is running, needs to be ran, or has completed
 * running.
 *
 * @private
 * @return {void}
 */
Breeze.prototype.check = function _breezeCheck (pop) {
  this.steps = this.steps || []

  if (pop && this.steps.length) {
    return this.run()
  }

  if (pop && !this.steps.length) {
    return this.running = false
  }

  if (this.steps.length && !this.running) {
    this.run()
  }
}

/**
 * Adds callback to the system stack when first argument passed is of a
 * truthy status.
 *
 * @param  {Boolean}  arg    Argument to be evaluated
 * @param  {Function} next   Callback to be pushed onto the stack
 * @return {this}
 */
Breeze.prototype.when = Breeze.prototype.maybe = function _breezeMaybeWhen (arg, next) {
  if (this.err) return this

  this.steps.push(['when', arg, next])
  this.check()
  return this
}

/**
 * Adds callback to the system when first argument is evaluated as true, and
 * no none calls have been invoked.
 *
 * @param  {Boolean}  arg    Argument to be evaluated
 * @param  {Function} next   Callback to be pushed onto stack
 * @return {this}
 */
Breeze.prototype.some = function _breezeSome (arg, next) {
  if (this.err || this.hasNoneHappened) return this

  this.hasSome = true
  this.steps.push(['some', arg, next])
  this.check()
  return this
}

/**
 * Adds callback to the system if no some callback was triggered.
 *
 * @param  {Function} next   Callback to be pushed onto stack
 * @return {this}
 */
Breeze.prototype.none = function _breezeNone (next) {
  if (this.err) return this

  if (!this.hasSome) {
    throw new Error("Cannot add .none check before adding .some checks")
  }

  if (this.hasSome) {
    this.hasNoneHappened = true
    this.steps.push(['none', next])
    this.check()
  }

  return this
}

/**
 * Adds callback to the system
 *
 * @param  {Function} next Callback to be pushed onto the stack
 * @return {this}
 */
Breeze.prototype.then = function _breezeThen (next) {
  if (this.err) return this

  this.steps.push(next)
  this.check()
  return this
}

/**
 * Checks whether system has an err and invokes callback, or saves callback for later
 * invocation.
 *
 * @param  {Function} next Callback to be invoked should err exist
 * @return {this}
 */
Breeze.prototype.catch = function _breezeCatch (next) {
  if (this.err) {
    next(this.err)
    return this
  }

  this.onError = next
  this.check()
  return this
}

/**
 * Resets system
 */
Breeze.prototype.reset = function _breezeReset () {
  this.hasMaybeHappened = undefined
  this.hasNoneHappened = undefined
  this.hasSomeHappened = undefined
  this.hasSome = undefined
  this.onError = undefined
  this.running = undefined
  this.err = undefined
  this.steps = []

  return this
}

/**
 * Create new instance of Breeze
 */
module.exports = function breeze (method) {
  return new Breeze(method)
}
