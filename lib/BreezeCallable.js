const BreezeHelpers = require('./BreezeHelpers')

class BreezeCallable {
  constructor (obj) {
    this.id = obj.method ? obj.method.name : false
    this.type = obj.type
    this.error = false
    this.resolution = false
    this.benchmark = BreezeHelpers.benchmark()

    this.setMethod(obj.method)

    if (obj.conditional) {
      this.setConditional(obj.conditional)
    }
  }

  setMethod (method) {
    this.method = (args) => {
      this.benchmark = BreezeHelpers.benchmark(this.benchmark)

      if (this.conditional && !this.conditional(args)) {
        this.failed = true
        this.benchmark = BreezeHelpers.benchmark(this.benchmark)
        return args
      }

      return BreezeHelpers.toCallback(method)(args).then(rargs => {
        this.args = args
        this.resolution = rargs
        this.benchmark = BreezeHelpers.benchmark(this.benchmark)
        return rargs
      }).catch(error => {
        this.args = args
        this.errored = error
        this.benchmark = BreezeHelpers.benchmark(this.benchmark)
        throw error
      })
    }
  }

  setConditional (conditional) {
    this.conditional = BreezeHelpers.toConditional(conditional)
  }
}

module.exports = BreezeCallable
