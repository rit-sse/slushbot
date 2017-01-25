import fetch from 'node-fetch';
import nconf from '../config';

export default function registerNotifications() {
  fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: nconf.get('SLACK_BOT_TOKEN'),
      channel: 'C07RYN2JZ',
      text: 'Hi guys, I\'m alive',
    }),
  })
  .then(() => console.log('done'))
  .catch(err => console.log(err));
}
