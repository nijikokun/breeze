class BreezeHelpers {
  static isFunction (obj) {
    return typeof obj === 'function'
  }

  static isPromise (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
  }

  static toCallback (callable) {
    return (args) => Promise.resolve().then(() => this.isPromise(callable) ? callable : callable(args))
  }

  static toConditional (conditional) {
    return BreezeHelpers.isFunction(conditional) ? conditional : () => conditional
  }

  static toCallbackSignature (callable) {
    return values => callable(values)
  }

  static benchmark (benchmark) {
    let time = Date.now()

    return benchmark ? {
      startedAt: benchmark.startedAt,
      endedAt: time,
      diff: Math.round(time - benchmark.startedAt)
    } : { startedAt: time }
  }
}

module.exports = BreezeHelpers
