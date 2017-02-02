import MatcherRegister from '../../matcher-register';
import {
  createClient,
} from 'redis';

const client = createClient('redis://redis:6379');

const matcher = {
  name: 'events',
  help: {
    '/sse events subscribe': 'Subscribes current channel to event changes. Subscriptions are stored in redis, so may go away until we change that.',
  },

  match(bot, message) {
    const matchCommand = message.text.match(/events (subscribe)\s?(.*)/);
    if (matchCommand) {
      client.set('events::' + message.channel, true);
      bot.replyPublic(message, 'Adding ' + message.channel + ' to event creation notifications');
  },
};

MatcherRegister.registerSlash(matcher);
