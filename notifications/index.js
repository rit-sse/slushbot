import {
  createClient,
} from 'redis';

export default function registerNotifications(slushbot) {
  const client = createClient('redis://redis:6379');
  client.on('message', (chan, msg) => {
    slushbot.api.chat.postMessage({
      text: msg,
      channel: 'sse-tech',
      as_user: true,  // eslint-disable-line camelcase
    }, (err, res) => {
      if (!err) {
        console.log(res);
      } else {
        console.log(err);
      }
    });
  });
  // Sub
  client.subscribe('events');
}
