import MatcherRegister from '../../matcher-register';
import {
  createClient,
} from 'redis';
import nconf from '../../config';

const client = createClient(nconf.get('redis'));

const matcher = {
  name: 'notify',
  help: {
    '/sse notify [events|memberships|quotes] [subscribe|unsubscribe]': 'Subscribes or unsubscribe the  current channel to table changes. Subscriptions are stored in redis, so may go away until we change that.',
  },

  match(bot, message) {
    const matchCommand = message.text.match(/notify (events|memberships|quotes) (subscribe|unsubscribe)/);
    if (matchCommand) {
      if (matchCommand[2] === 'subscribe') {
        client.set(`${matchCommand[1]}::${message.channel}`, true);
        bot.replyPublic(message, `Adding ${message.channel} to ${matchCommand[1]} creation notifications`);
      } else {
        client.del(`${matchCommand[1]}::${message.channel}`);
        bot.replyPublic(message, `Removing ${message.channel} from ${matchCommand[1]} creation notifications`);
      }
    }
  },
};

MatcherRegister.registerSlash(matcher);
