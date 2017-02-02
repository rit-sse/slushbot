import {
  createClient,
} from 'redis';

let sub = undefined;
let client = undefined;

function redisConns() {
    sub = createClient('redis://redis:6379');
    client = createClient('redis://redis:6379');
}

function sendMessageToChannel(text, channel, slushbot) {
  console.log('sending to: ' + channel);
  slushbot.api.chat.postMessage({
    text,
    channel,
    as_user: true,  // eslint-disable-line camelcase
  }, (err, res) => {
    if (!err) {
      console.log(res);
    } else {
      console.log(err);
    }
  });
}

export function fetchChannelList(redis) {
  console.log('fetching channels for events');
  return new Promise((accept, reject) => {
    redis.keys('events::*', (err, values) => {
      if (!err) {
        const names = values.map(keyname => keyname.split('::')[1]);
        accept(names);
      } else {
        reject(err);
      }
    });
  });
}

export default function registerNotifications(slushbot) {
  if (sub === undefined || client === undefined) {
    redisConns();
  }
  sub.on('message', (chan, msg) => {
    console.log('notification on events: ' + msg);
    fetchChannelList(client)
      .then(channels => {
        console.log('channel list: ' + channels);
        channels.map(channel => {
          sendMessageToChannel(msg, channel, slushbot);
        });
      })
      .catch(err => console.err(err));
  });
  // Sub
  sub.subscribe('events');
}
