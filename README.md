# querymemcache

`querymemcache` is a node.js module designed to allow you to cache the frequent queries to the DB with using of memcache. It can work with any SQL database.

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save querymemcache

If you don't have or don't want to use npm:

    $ cd ~/.node_modules
    $ git clone git://github.com/bgrusnak/querymemcache.git

## Usage

To require the library and initialize it 

```javascript
import QueryMemCache from 'querymemcache';
var cache=QueryMemCache({
  lifetime: 300, // cache lifetime in seconds
  servers: 'localhost:11211', // local server
    options: {
        maxKeySize: 2000  // the size of the key
    }
})

```

### Methods

There only one method 

#### `listDatabases`

Get the databases linked to the authenticated account

`.listDatabases()`

#### `listCollections`

Get the collections in the specified database

`.process({observe:observedFields, change:changedFields}, queryFunction, callbackFunction)` 

***Parameters:***

Name | Description | Type | Required |
-----|------------ |------|:----------:|
observe| List of field names or arrays [field, operand, value] which needs to be observed | `Array` | No |
change| List of field names or arrays [field, operand, value] which will b changed | `Array` | No |

queryFunction - the function, which will called if no valid data is available.
callbackFunction - the function, which will receive the result of the cache process


## Requirements

- node.js v7.10.0+ (7.10.0 is the version I used to develop this module.  I'm
  unsure if it will work with previous ones.  If you run a previous version, and
  it works, let me know and I'll update this)
- [memcached](https://github.com/3rd-Eden/memcached) 2.2.2+


## Contributions

If you run into problems, have questions, or whatever else you can open an
issue on this repository. If you'd like to submit
a patch, shoot me a pull request.  I'd like to keep this module simple, so if
you want to add all kinds of crazy functionality - you might want to fork.
When in doubt, send a pull request - the worst that can happen is that I won't
merge it.

## License

[MIT](https://github.com/bgrusnak/mlab-data-api/blob/master/LICENSE) © Ilya Shlyakhovoy