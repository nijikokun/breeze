# Breeze

Functional async flow control library.

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

- `breeze(next)` - Initialize breeze flow system, supports initial `.then` method.
- `.when(arg, next)` - When `arg` is truthy, add `next` to the stack
- `.maybe(arg, next)` - When `arg` is truthy, add `next` to the stack, sugar for `breeze.when`
- `.some(arg, next)` - When `arg` is truthy and no other `some` or `none` has ran, add to the stack
- `.none(next)` - Whenever no `some` have ran, add callback to the stack
- `.then(next)` - Add callback to stack
- `.catch(next)` - Any error caught will terminate stack and be sent here
- `.reset()` - Reset current system

## Example

```js
// initialize our step system
// the method passed here is passed to .then, its optional, you can omit it.
breeze(function (done) {
  done()
})
// truthy check
.maybe(1 === 1, function (done) {
  console.log(1)
  done(null, 'hey,', 'you can pass values!')
})
// checks can also be functions and are passed previous values.
.some(function (part1, part2) {
  return 1 === 0
}, function (done, msg) {
  console.log(2, msg)
  done()
})
// invoked only when no .some checks pass.
.none(function (done, part1, part2) {
  console.log(2, ',since no some happened,', part1, part2)
  done()
})
// always invoked as long as the chain continues.
.then(function (done) {
  console.log(3)
  done('It finally happened.')
})
// invoked on error
.catch(function (err) {
  console.error('An error occurred!', err)
})
```

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

[download]: https://github.com/Nijikokun/breeze/archive/v1.0.1.zip
