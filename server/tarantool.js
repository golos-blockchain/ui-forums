const TarantoolDriver = require('tarantool-driver');
const CONFIG_SEC = require('../configSecure');

const instance = {
    'tarantool': null,
    'chainproxy': null,
};

class Tarantool {
    constructor(key) {
        this.key = key;
        const host = CONFIG_SEC[key].host;
        const port = CONFIG_SEC[key].port;
        const username = CONFIG_SEC[key].username;
        const password = CONFIG_SEC[key].password;
        const connection = this.connection = new TarantoolDriver({host, port});
        this.ready_promise = new Promise((resolve, reject) => {
            connection.connect()
            .then(() => connection.auth(username, password))
            .then(() => resolve())
            .catch(error => resolve(false));
        });
    }

    makeCall(call_name, args) {
        return this.ready_promise
            .then(() => this.connection[call_name].apply(this.connection, args))
            .catch(error => {
                if (error.message.indexOf('connect') >= 0)
                    instance[this.key] = null;
                return Promise.reject(error);
            });
    }

    select() {
       return this.makeCall('select', arguments);
    }
    delete() {
        return this.makeCall('delete', arguments);
    }
    insert() {
        return this.makeCall('insert', arguments);
    }
    replace() {
        return this.makeCall('replace', arguments);
    }
    update() {
        return this.makeCall('update', arguments);
    }
    eval() {
        return this.makeCall('eval', arguments);
    }
    call() {
        return this.makeCall('call', arguments);
    }
    upsert() {
        return this.makeCall('upsert', arguments);
    }
}

Tarantool.instance = function (key) {
    if (!instance[key]) instance[key] = new Tarantool(key);
    return instance[key];
};

module.exports = Tarantool;
