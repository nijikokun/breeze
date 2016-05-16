// Constructor
function Breeze (method) {
  this.steps = []

  if (typeof method === 'function' || isPromise(method)) {
    this.then(method)
  }
}

// Run next step registered on system step list
Breeze.prototype.run = function () {
  var args = this.args || []
  var step = this.steps.shift()
  var type = step[0]

  if (this.skip && typeof this.skip === 'number') {
    this.skip--
    return this.check(true)
  }

  try {
    this.running = true
    if (this[type + 'Handler']) return this[type + 'Handler'](step, args)
    return this.check(true)
  } catch (err) {
    return this.onUncaughtError(err)
  }
}

// Set error on system object, invokes available error methods, short-circuit system
Breeze.prototype.onUncaughtError = function (err) {
  this.err = err
  if (this.onError) this.onError(err)
  if (this.onDeferredError) this.onDeferredError(err)
  return (this.steps = [] && this.check())
}

// Determine system state and invoke next step when possible
Breeze.prototype.check = function (pop, skip) {
  this.steps = this.steps || []

  if (pop && this.steps.length) {
    return this.run()
  }

  if (pop && !this.steps.length) {
    return (this.running = false)
  }

  if (this.steps.length && !this.running) {
    return this.run()
  }
}

// Add iteration step to the system
Breeze.prototype.each = function (iterable, iteratee, next) {
  if (this.err) return this
  this.steps.push(['each', iterable, iteratee, next])
  this.check()
  return this
}

// Iterate over each iterable and invoke iteratee for each item in iterables,
// on error break iteration and give error to system
// @private
Breeze.prototype.eachHandler = function (step, args) {
  var iterables = step[1]
  var iteratee = step[2]
  var next = step[3]
  var system = this
  var index = 0
  var count = 0
  var lookup
  var length

  if (typeof iterables === 'function') {
    iterables = iterables.apply(this.context, args)
  }

  if (isPlainObject(iterables)) {
    lookup = iterables
    iterables = Object.keys(iterables)
  }

  length = iterables.length

  function iterableCallback (error, value) {
    if (system.err) return
    if (error) return system.onUncaughtError(error)
    if (arguments.length > 1) {
      if (lookup) {
        lookup[iterables[count]] = value
      } else {
        iterables[count] = value
      }
    }

    if (++count === length) {
      if (typeof next === 'function') {
        args.unshift(system.createStepCallback())
        return next.apply(system.context || [], args)
      }

      return system.check(true)
    }
  }

  for (; index < length; index++) {
    setImmediate(
      iteratee,
      lookup ? lookup[iterables[index]] : iterables[index],
      lookup ? iterables[index] : index,
      iterableCallback
    )
  }

  return null
}

// Add conditional step to the system
Breeze.prototype.if = Breeze.prototype.when = Breeze.prototype.maybe = function (arg, next) {
  if (this.err) return this
  this.steps.push(['when', arg, next])
  this.check()
  return this
}

// Add step to evaluate truthyness of first argument to invoke callback
Breeze.prototype.some = function (arg, next) {
  if (this.err || this.hasNoneHappened) return this
  this.hasSome = true
  this.steps.push(['some', arg, next])
  this.check()
  return this
}

// When some has already been invoked short-circuit and continue, when check is truthy
// invoke the resolution method, otherwise continue.
// @private
Breeze.prototype.someHandler = Breeze.prototype.whenHandler = function (step, args) {
  var resolution = step[2]
  var check = step[1]
  var type = step[0]

  if (type === 'some' && this.hasSomeHappened) {
    return this.check(true)
  }

  if ((typeof check === 'function' && check.apply(this.context, args)) || (typeof check !== 'function' && check)) {
    if (type === 'when') this.hasWhenHappened = true
    if (type === 'some') this.hasSomeHappened = true

    step = resolution
    args.unshift(this.createStepCallback())
    return step.apply(this.context, args)
  }

  return this.check(true)
}

// Add step to handle the case of when no thruthy some statements occured
Breeze.prototype.none = function (next) {
  if (this.err || this.hasNoneHappened) return this

  if (!this.hasSome) {
    throw new Error('Cannot add .none check before adding .some checks')
  }

  if (this.hasSome) {
    this.hasNoneHappened = true
    this.steps.push(['none', next])
    this.check()
  }

  return this
}

// Determine whether a some step has passed, when none have passed invoke passed none callback.
// @private
Breeze.prototype.noneHandler = function (step, args) {
  if (!this.hasSomeHappened) {
    this.hasNoneHappened = true
    step = step[1]
    args.unshift(this.createStepCallback())
    return step.apply(this.context, args)
  }

  return this.check(true)
}

// Add variable passing step to system to allow quick introduction of variables to system
Breeze.prototype.pass = function () {
  if (this.err) return this
  var step
  step = cloneArguments(arguments)
  step.unshift('pass')
  this.steps.push(step)
  this.check()
  return this
}

// Determine step arguments and invoke first argument when it is a function, then concatenate results
// to the system's arguments list.
// @private
Breeze.prototype.passHandler = function (step, args) {
  step.shift()
  if (step.length === 1 && typeof step === 'function') step[0] = step[0]()
  this.args = args
  this.args = this.args.concat(step)
  return this.check(true)
}

// Add generic thennable step to the system
Breeze.prototype.then = function (next) {
  if (this.err) return this
  this.steps.push(['then', next])
  this.check()
  return this
}

// Thennable logic handler
// @private
Breeze.prototype.thenHandler = function (step, args) {
  args.unshift(this.createStepCallback())
  return step[1].apply(this.context || this, args)
}

// Add error handler to system, invoked immediately when error exists.
Breeze.prototype.catch = function (next) {
  if (this.err) {
    next(this.err)

    if (this.onDeferredError) {
      this.onDeferredError(this.err)
    }

    return this
  }

  this.onError = next
  this.check()
  return this
}

// Generate deferred promise object for the current flow system
Breeze.prototype.promise = Breeze.prototype.deferred = function () {
  var system = this
  var deferred = {
    then: function (next) {
      if (system.err) return deferred

      system.steps.push(['then', function () {
        return next.apply(this, cloneArguments(arguments, 1))
      }])

      system.check()
      return deferred
    },

    catch: function (next) {
      if (system.err) return next(system.err)
      system.onDeferredError = next
      return deferred
    }
  }

  return deferred
}

// Takes the next (optional) callback, and generates a callback to be passed as the first argument.
Breeze.prototype.createStepCallback = function () {
  var system = this

  function handler (err) {
    if (err) return system.onUncaughtError(err)
    system.args = cloneArguments(arguments, 1)
    system.check(true)
  }

  function success () {
    system.args = system.args.concat(cloneArguments(arguments))
    system.args.unshift(null)
    handler.apply(system.context, system.args)
  }

  return function (err) {
    if (err === 'skip') {
      system.skip = arguments[1] || 1
      system.args = system.args ? system.args.slice(1) : []
      return system.check(true)
    }

    system.context = this
    system.args = cloneArguments(arguments, 1)

    if (isPromise(err)) {
      return typeof err.catch === 'function'
        ? err.then(success).catch(handler)
        : err.then(success, handler)
    }

    return handler.apply(system.context, arguments)
  }
}

// Resets system state to an empty state
Breeze.prototype.reset = function () {
  this.hasMaybeHappened = null
  this.hasNoneHappened = null
  this.hasSomeHappened = null
  this.hasSome = null
  this.onError = null
  this.running = null
  this.err = null
  this.args = null
  this.context = null
  this.steps = []

  return this
}

// Debug garbage collection utility
// @private
Breeze.prototype.gc = function () {
  this.reset()
  this.steps = null
}

// Export breeze constructor
module.exports = function breeze (method) {
  return new Breeze(method)
}

// Shim for setImmediate using setTimeout
if (typeof setImmediate !== 'function') {
  function setImmediate () {
    var args = cloneArguments(arguments)
    args.splice(1, 0, 0)
    return setTimeout.apply(null, args)
  }
}

// Convert promise signature into callback signature
function promiseToCallback (promise) {
  return function convertedPromiseCallbackStructure (callback) {
    return typeof promise.catch === 'function'
      ? promise.then(function (data) {
          setImmediate(callback, null, data)
        }).catch(function (error) {
          setImmediate(callback, error)
        })
      : promise.then(function (data) {
          setImmediate(callback, null, data)
        }, function (error) {
          setImmediate(callback, error)
        })
    }
}

// Clone and slice arguments object into a new array without leaking.
function cloneArguments (arg, begin, end) {
  var i = 0
  var len = arg.length
  var args = new Array(len)

  for (; i < len; ++i) args[i] = arg[i]
  return args = args.slice(begin || 0, end || undefined)
}

// Determine whether passed object is a promise or promise variation
function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

// Determine whether passed object is a plain object or not.
function isPlainObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}