import {
  createClient,
} from 'redis';

function sendMessageToChannel(text, channel, slushbot) {
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

export function fetchChannelList(client) {
  return new Promise((accept, reject) => {
    client.keys('events::*', (err, values) => {
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
  const client = createClient('redis://redis:6379');
  client.on('message', (chan, msg) => {
    fetchChannelList(client)
      .then(channels => {
        for (channel in channels) {
          sendMessageToChannel(msg, channel, slushbot);
        }
      });
  });
  // Sub
  client.subscribe('events');
}
