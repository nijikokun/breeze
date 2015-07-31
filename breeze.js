/**
 * Initializes breeze class
 */
function Breeze () {
  this.steps = []
}

/**
 * Takes the next (optional) callback, and generates the done callback to be passed as the first argument.
 *
 * @private
 * @param  {Function} next Next callback in the system to be invoked.
 * @return {Function} Completion callback, first argument is error, subsequent arguments are passed down the chain.
 */
Breeze.prototype.createDoneCallback = function _breezeCreateDoneCallback (next) {
  var system = this

  return function (err) {
    var args = Array.prototype.slice.call(arguments, 1)
    var context

    // Short circuit the system
    if (err) {
      if (!this.onError) {
        system.err = err
      } else {
        system.onError(err)
      }

      system.steps = []
      return system.check()
    }

    // Continue
    if (next) {
      args.unshift(system.createDoneCallback(system.steps.shift()))
      next.apply(this, args)
    } else {
      system.args = args
      system.context = this
    }

    system.check(true)
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
  this.running = true
  func = this.steps.shift()
  args.unshift(this.createDoneCallback(this.steps.shift()))
  func.apply(this.context, args)
}

/**
 * Checks whether the system is running, needs to be ran, or has completed
 * running.
 *
 * @private
 * @return {void}
 */
Breeze.prototype.check = function _breezeCheck (pop) {
  if (pop) {
    if (this.steps.length) {
      this.run()
    } else {
      this.running = false
    }

    return
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
  if (arg) {
    this.hasMaybeHappened = true
    this.steps.push(next)
    this.check()
  }

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
  this.hasSome = true

  if (arg && !this.hasNoneHappened) {
    this.hasSomeHappened = true
    this.steps.push(next)
    this.check()
  }
  return this
}

/**
 * Adds callback to the system if no some callback was triggered.
 *
 * @param  {Function} next   Callback to be pushed onto stack
 * @return {this}
 */
Breeze.prototype.none = function _breezeNone (next) {
  if (!this.hasSomeHappened && this.hasSome) {
    this.hasNoneHappened = true
    this.steps.push(next)
    this.check()
  }

  if (!this.hasSome) {
    throw new Error("Cannot add none callback before some callback")
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
module.exports = function breeze () {
  return new Breeze()
}
