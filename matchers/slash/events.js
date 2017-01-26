import MatcherRegister from '../../matcher-register';

const matcher = {
  name: 'events',
  help: {
    '/events subscribe': 'Subscribes current channel to event changes. Subscriptions are stored in redis, so may go away until we change that.',
  },

  match(bot, message) {
    const matchCommand = message.text.match(/events (subscribe)\s?(.*)/);
    if (matchCommand) {
      bot.replyPrivate(message, 'We hear you, but we\'re not doing it yet.');
    }
  },
};

MatcherRegister.registerSlash(matcher);
