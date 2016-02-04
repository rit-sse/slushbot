'use strict';

import redis from 'redis';

function createForMethod(method, client, config) {
  return {
    get(id, cb) {
      client.hget(`${config.namespace}:${method}`, id, (err, res) => cb(err, JSON.parse(res)));
    },

    save(object, cb) {
      if (object.id) {
        client.hset(`${config.namespace}:${method}`, object.id, JSON.stringify(object), cb);
      }
    },

    all(cb, options) {
      if (err || res === null) {
        return cb(err, res);
      }

      const obj = {};
      const array = [];

      for (const i in res ) {
        obj[i] = JSON.parse(res[i]);
        array.push(obj[i]);
      }

      cb(err, options && options.type === 'object' ? obj : array);
    },

    allById(cb) {
      this.all(cb, { type: 'object' });
    },
  };
}

export default function redisStore(config = {}) {
  config.namespace = config.namespace || 'botkit:store';

  const client = redis.createClient(config);
  const methods = config.methods || ['teams', 'users', 'channels', 'messages'];

  return methods.reduce((obj, m) => {
    obj[m] = createForMethod(m, client, config);
    return obj;
  }, {});
}

