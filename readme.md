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

### Breeze Flow

```js
import Breeze from 'breeze'

let flow = new Breeze()
```

### Breeze Flow Instance Methods

#### then(method: Function|Promise)

  Add step to flow chain.

  ```js
  flow
    .then(value => 'function with return value')
    .then(value => console.log('function says:', value))
    .then(new Promise((resolve, reject) => {
      return resolve('Promise resolution')
    }))
    .then(value => console.log('promise says:', value))
  ```

  **Note:** You are not required to chain instance methods.

  ```js
  flow.then(value => 'function with return value')
  flow.then(value => console.log('function says:', value))
  ```

#### catch(type?: ErrorType, handler: Function)

  Handle chain rejections. Accepts an optional custom error type to capture specific rejections in the flow chain. 

  ```js
  flow.then(() => throw new Error('Spoiler Alert'))

  flow.catch(CustomError, err => console.log('Specialized Catch:', err))

  flow.catch(err => console.log('Generic Catch:', err))
  ```

#### id(name: String)

  Identify a step. Useful for benchmarking and logs.

  ```js
  // Create a flow step
  flow.then(results => client.get('/users'))

  // Identify step for benchmarking and logs
  flow.id('fetch-users')
  ```

#### each(promises: Array<Promise>, method: Function)

  Invoke method on results of each Promise in the given Array.
  
  **Todo:** Support previous chain `Array<Promise>` value.

#### all(promises: Array<Promise>)

  Map promise results to an array **in order resolved**.

#### map(promises: Array<Promise>)

  Map promise results to an array **in given order**.

#### skip(steps: Number)

  Skip `n` steps after this point.

#### get(index: Number)

  Obtain entry in array at given index in next step.
  
  ```js
  flow
    .then(() => [1,2,3])
    .get(0)
    .then(item => console.log(item)) // Outputs: 1
  ```

#### when(conditional: Function|Truthy, method: Function)
  
  Invokes method when the `conditional` argument is `truthy`, otherwise skips to the next step.

  ```js
  flow
    .then(() => [1, 2, 3])
    .when(result => result[0] === 1, result => console.log(result[0], '=', 1))
  ```

  This is a basic example to illustrate the small power of how you can make `if` statements
  asynchronous.

#### spread(method: Function)

  Spreads each `argument` from a successful step as individual arguments on the passed `method`

  ```js
  flow
    .then(() => ['username', 'Steven Seagal'])
    .spread((field, value) => console.log(field, '=', value)) // username = Steven Seagal
  ```

#### tap(method: Function)

  Invoke `method` without modifying the return result of the step, useful for inspection.

  ```js
  flow
    .then(() => [1, 2, 3])
    .tap(result => console.log(result))
    .then(result => console.log(result)) // [1,2,3]
  ```

#### return(value: any)

Convenience method for:

```js
.then(() => value)
```

#### throw(reason: any)

Convenience method for:

```js
.then(() => throw error)
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

[download]: https://github.com/Nijikokun/breeze/archive/v1.2.2.zip
