# Mithril Component

React style components for [Mithril.js][mithril]

[![version][npm-version]][npm-url]
[![License][npm-license]][license-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Coverage Status][codeclimate-coverage]][codeclimate-url]
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

- `breeze()` - Initialize breeze flow system
- `.when(arg, next)` - When `arg` is truthy, add `next` to the stack
- `.maybe(arg, next)` - When `arg` is truthy, add `next` to the stack, sugar for `breeze.when`
- `.some(arg, next)` - When `arg` is truthy and no other `some` or `none` has ran, add to the stack
- `.none(next)` - Whenever no `some` have ran, add callback to the stack
- `.then(next)` - Add callback to stack
- `.catch(next)` - Any error caught will terminate stack and be sent here
- `.reset()` - Reset current system

## Example

```js
breeze()
  .maybe(1 === 1, function (done) {
    console.log(1)
    done(null, 'hey,', 'you can pass values!')
  })
  .some(1 === 0, function (done, msg) {
    console.log(2, msg)
    done()
  })
  .none(function (done, part1, part2) {
    console.log(2, ',since no some happened,', part1, part2)
    done()
  })
  .then(function (done) {
    console.log(3)
    done('It finally happened.')
  })
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

[download]: https://github.com/Nijikokun/breeze/archive/v1.0.0.zip
[mithril]: https://github.com/lhorie/mithril.js
