global.console = {
    warn: jest.fn(),
    log: jest.fn()
}

const QueryMemCache = require('./QueryMemCache.js');
var cache = new QueryMemCache({
    servers: 'localhost:11211',
    options: {
        maxKeySize: 2000
    }
})

test('Observe of empty value', () => {
    function callback(data) {
        expect(data).toBe(3);
    }

    cache.process(
        {
            observe: [
                ['first.a', '=', '1'],
                ['first.b', '=', '2'],
            ]
        },
        () => {
            return 3
        }
        , callback)
});

test('Observe of setted value', () => {
    function callback(data) {
        expect(data).toBe(3);
    }
    cache.process(
        {
            observe: [
                ['first.a', '=', '1']
            ]
        },
        () => {
            return 4
        }
        , callback);
});

test('Observe of another value', () => {
    function callback(data) {
        expect(data).toBe(5);
    }
    cache.process(
        {
            observe: [
                ['first.a', '=', '1'],
                ['first.b', '=', '2'],
                ['first.c', '=', '3']
            ]
        },
        () => {
            return 5
        }, callback
    );
});


test('Change and observe of value', () => {
    function callback(data) {
        expect(data).toBe(7);
    }

    cache.process(
        {
            change: [['first.a', '=', '1']],
        },
        () => {
            return 8
        }
    )
    cache.process(
        {
            observe: [
                ['first.a', '=', '1'],
                ['first.b', '=', '2'],
                ['first.c', '=', '3']
            ]
        },
        () => {
            return 7
        }, callback
    );
});