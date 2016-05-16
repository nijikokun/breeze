# Breeze

Functional async flow control library. Turn your asynchronous code into bite-sized synchronous looking functions.

[![version][npm-version]][npm-url]
[![License][npm-license]][license-url]
[![Downloads][npm-downloads]][npm-url]
[![Dependencies][david-image]][david-url]

## Install

- Download [the latest package][download]
- NPM: `npm install breeze`

## Usage

**Node.js / Browserify**

```js
var breeze = require('breeze')
```

## API

- `breeze(step)` - Initialize breeze flow system, supports initial `.then` method.
- `.pass(value)` - Introduce new value into flow system, argument is appended to system arguments passed through `next`.
- `.when(check, step)` - When `check` is truthy, add `step` to the stack
- `.maybe(check, step)` - When `check` is truthy, add `step` to the stack, sugar for `breeze.when`
- `.some(check, step)` - When `check` is truthy and no other `some` or `none` has ran, add to the stack
- `.none(step)` - Whenever no `some` have ran, add callback to the stack
- `.then(step)` - Add callback to stack
- `.each(iterables, iteratee, step)` - Iterate over an object / array and invoke a method for each entry. `iterables` is not a reference therefore, you must properly store `iterables` outside of the flow if you plan to update or modify the object.
- `.catch(step)` - Any error caught will terminate stack and be sent here
- `.deferred()` - Returns a deferred promise system, allowing for a passable then / catch.
- `.reset()` - Reset current system

### Step

The `step` method passed through breeze has a very small API, providing any `arguments` stored within the system passed through either the `next` or `.pass` methods, and the `next` callback method which is explained below.


```
function step (next, arguments...)
```

#### Next

The `next` method is the step callback system, it provides utility for short-circuiting the step system with an error, passing additional arguments along the chain, and skipping steps completely.

```
return next(err, arguments...)
```

The `next` method supports additional modes explained below.

##### Errors

When a *truthy* `err` is passed the system will short-circuit (no other actions will be taken) and `.catch` will be triggered.

##### Promises

When a `promise` is passed the system will attach to either a `then / catch` or `.then(success, catch)` method style depending on the promise type passed.

Whenever the promises `then / then success` method is invoked, any `arguments` passed along with the initial promise are placed at the *front* of the arguments array, and the success arguments will be *last*.

This allows you to chain multiple promises while still passing values down the chain.

```
next(promise, arguments...)
```

##### Skipping Steps

When you pass the string `skip` as the first argument in the `next` method, the next step in the sequence will be skipped completely.

You can skip multiple steps by providing a number as the second argument to `next` equalling the number of steps you wish to skip. Defaults to `1`.

```
next('skip', 1 /* optional; number of steps to skip */)
```

## Examples

- [basic](examples/basic.js) - Bare-bones example (`breeze`, `then`, `catch`)
- [promises](examples/promises.js) - Returning and using promises within breeze (`then`, `next(promise)`)
- [each](examples/each.js) - Breeze array iteration (`then`, `pass`, `each`, `catch`)
- [when](examples/when.js) - Conditional flows (`then`, `when`)


Check out the [examples](examples/) directory for more in-depth examples and tutorials of how to use breeze.

## License

Licensed under [The MIT License](LICENSE).

[license-url]: https://github.com/Nijikokun/breeze/blob/master/LICENSE

[travis-url]: https://travis-ci.org/Nijikokun/breeze
[travis-image]: https://img.shields.io/travis/Nijikokun/breeze.svg?style=flat

[npm-url]: https://www.npmjs.com/package/breeze
[npm-license]: https://img.shields.io/npm/l/breeze.svg?style=flat
[npm-version]: https://img.shields.io/npm/v/breeze.svg?style=flat
[npm-downloads]: https://img.shields.io/npm/dm/breeze.svg?style=flat

[codeclimate-url]: https://codeclimate.com/github/Nijikokun/breeze
[codeclimate-quality]: https://img.shields.io/codeclimate/github/Nijikokun/breeze.svg?style=flat
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/Nijikokun/breeze.svg?style=flat

[david-url]: https://david-dm.org/Nijikokun/breeze
[david-image]: https://img.shields.io/david/Nijikokun/breeze.svg?style=flat

[download]: https://github.com/Nijikokun/breeze/archive/v1.2.2.zip
