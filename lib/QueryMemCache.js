/*
	QueryMemCache - An unified SQL query caching for Node.js
	http://github.com/bgrusnak/querymemcache
	Released under the MIT license
*/

const Memcached = require('memcached');
const crypto = require('crypto');

module.exports = QueryMemCache;

function QueryMemCache(config) {
    this.config = config;
    this.version = "0.1.0";
    this.lifetime = config.lifetime || 300;
    this.MemcachedConnection = new Memcached(config.servers, config.options);
}

/*
process - the one function, which solves the full caching stage


*/

QueryMemCache.prototype.hashFields = function (fields) {
    if (Array.isArray(fields)) {
        return fields.map(field => {
            var hash = crypto.createHash('sha256');
            if (Array.isArray(field)) {
                return hash.update(field.join(':')).digest('base64')
            } else {
                switch (typeof field) {
                    case 'string': return hash.update(field).digest('base64');
                    default: return hash.digest('base64')
                }
            }
        })
    } else {
        return []
    }
}
/*
QueryMemCache.prototype.process = function (query, callback) {
    var parent=this
    var observe =crypto.createHash('sha256').update(query).digest('base64')
    this.MemcachedConnection.get(observe, function (err, data) {
        if (err) {
            var rt=callback()
            this.MemcachedConnection.set(observe, rt, parent.lifetime)
            return rt
        }else {
            return data
        }
    });
};
*/

QueryMemCache.prototype.process = function (fields, callback, returnCallback) {
    var observes = this.hashFields(fields.observe)
    var changes = this.hashFields(fields.change)
    var parent = this
    var observehash = Array.isArray(observes) && observes.length > 0 ? crypto.createHash('sha256').update(observes.join(';')).digest('base64') : undefined;
    if (Array.isArray(changes) && changes.length > 0) {
        this.MemcachedConnection.getMulti(changes, function (err, data) {
            data.map(changed => {
                if (Array.isArray(changed)) changed.map(item => { parent.MemcachedConnection.del(item) });
            })
            changes.map(item => { parent.MemcachedConnection.del(item) })
            if (observehash) {
                parent.MemcachedConnection.getMulti(observes, function (err, gotData) {
                    if (observes.length != gotData.length) {
                        observes.map(observed => {
                            if (Array.isArray(observed)) observed.map(item => { parent.MemcachedConnection.del(item) });
                        })
                        observed.map(item => { parent.MemcachedConnection.del(item) })
                        var res = callback()
                        parent.MemcachedConnection.set(observehash, res)
                        observes.map(observed => {
                            parent.MemcachedConnection.set(observed, observehash)
                        })
                        if (returnCallback) returnCallback(res)
                    } else {
                        var id = gotData.reduce((same, current) => {
                            if (returnCallback) returnCallback(same == current ? current : undefined)
                        })
                        if (id) {
                            parent.MemcachedConnection.gets(id, function (err, finalData) {
                                if (returnCallback) returnCallback(finalData)
                            })
                        } else {
                            var res = callback()
                            parent.MemcachedConnection.set(observehash, res)
                            observes.map(observed => {
                                parent.MemcachedConnection.set(observed, observehash)
                            })
                            if (returnCallback) returnCallback(res)
                        }
                    }
                })
            } else {
                return callback()
            }
        });
    }
    else {
        if (observehash) {
            parent.MemcachedConnection.getMulti(observes, function (err, gotData) {
                if (err) {
                    var res = callback()
                    parent.MemcachedConnection.set(observehash, res)
                    observes.map(observed => {
                        parent.MemcachedConnection.set(observed, observehash)
                    })
                    if (returnCallback) returnCallback(res)
                } else {
                    if (observes.length != gotData.length) {
                        observes.map(observed => {
                            if (Array.isArray(observed)) observed.map(item => { parent.MemcachedConnection.del(item) });
                        })
                        observes.map(item => { parent.MemcachedConnection.del(item) })
                        var res = callback()
                        parent.MemcachedConnection.set(observehash, res)
                        observes.map(observed => {
                            parent.MemcachedConnection.set(observed, observehash)
                        })
                        if (returnCallback) returnCallback(res)
                    } else {
                        var id = gotData.reduce((same, current) => {
                            return same == current ? current : undefined
                        })
                        if (id) {
                            parent.MemcachedConnection.get(id, function (err, finalData) {
                                if (returnCallback) returnCallback(finalData)
                            })
                        } else {
                            var res = callback()
                            parent.MemcachedConnection.set(observehash, res)
                            observes.map(observed => {
                                parent.MemcachedConnection.set(observed, observehash)
                            })
                            if (returnCallback) returnCallback(res)
                        }
                    }
                }
            })
        } else {
            if (returnCallback) returnCallback(callback())
        }
    }
};


QueryMemCache.prototype.finish = function () {
    this.MemcachedConnection.end();
};