# Breeze

Functional async flow control library built on promises. Managing promises and async code has never been easier.

[![version][npm-version]][npm-url]
[![License][npm-license]][license-url]
[![Downloads][npm-downloads]][npm-url]
[![Dependencies][david-image]][david-url]

## Features

- Small footprint
- Native promise support
- No chaining required
- Benchmarking (yes, even Promises)
- Logging (Chain logs, argument logs, and more...)

## Install

- Download [the latest package][download]
- NPM: `npm install breeze`

## Usage

**Node.js / Browserify / Webpack**

```js
const Breeze = require('breeze')
```

## Documentation

#### Creating a flow:

```js
let flow = new Breeze()
```

#### Flow methods:

##### `.then(Promise, Mixed)`

Step function, can be a `Promise`, `Function` with a return value, or a value.

```js
flow
  .then(result => 'function with return value')
  .then(result => console.log('function says:', result))
  .then(new Promise((resolve, reject) => {
    return resolve('Promise resolution')
  }))
  .then(result => console.log('promise says:', result))
```

Unlike promises you are not required to chain breeze flows:

```js
flow.then(result => 'function with return value')
flow.then(result => console.log('function says:', result))
```

##### `.catch([Exception exception, ], Function method)`

Error handler, invoked after promise chain and on step error. Can be placed in multiple locations along 
the flow chain to capture specific steps, or specific exceptions and handle.

```js
flow
  .then(() => throw new Error('Spoiler Alert'))
  .catch(Error, err => console.log('Specialized Catch:', err))
  .catch(err => console.log('Generic Catch:', err))
```

##### `.id(String name)`

Identify step. Use after defining step to have identifier show in stacktrace.

##### `.all(Array promises)`

Map promise results to an array **in order resolved**.

##### `.skip(Integer amount)`

Skip steps in chain.

##### `.map(Array promises)`

Map promise results to an array **in given order**.

##### `.get(Integer index)`

Obtain entry in array at given index in next step.

##### `.tap(`

##### `.when`

##### `.each`

##### `.spread`

##### `.return`

##### `.throw`

##### `.map`

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
