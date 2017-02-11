import {
  createClient,
} from 'redis';
import nconf from '../config';

let sub;
let client;

function redisConns() {
  sub = createClient(nconf.get('redis'));
  client = createClient(nconf.get('redis'));
}

export function fetchChannelList(redis, table) {
  console.log(`fetching channels for ${table}`);
  return new Promise((accept, reject) => {
    redis.keys(`${table}::*`, (err, values) => {
      if (!err) {
        const names = values.map(keyname => keyname.split('::')[1]);
        accept(names);
      } else {
        reject(err);
      }
    });
  });
}

export default function registerNotifications(slushbot, table, sendMessageToChannel) {
  if (!sub || !client) {
    redisConns();
  }
  sub.on('message', (chan, msg) => {
    console.log(`notification on ${table}: ${msg}`);
    fetchChannelList(client, table)
      .then(channels => {
        console.log(`channel list: ${channels}`);
        channels.map(channel => {
          sendMessageToChannel(msg, channel, slushbot);
        });
      })
      .catch(err => console.err(err));
  });
  // Sub
  sub.subscribe(table);
}
