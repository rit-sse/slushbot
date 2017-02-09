import MatcherRegister from '../../matcher-register';
import getAPI from '../../api';

const matcher = {
  name: 'whois',
  help: {
    '/sse whois [position]': 'who currently holds the position',
  },

  match(bot, message) {
    const api = getAPI();
    const { Officers } = api;

    const matchCommand = message.text.match(/whois (.+)/);

    if (matchCommand) {
      const [, email] = matchCommand;

      return Officers
        .all({ email, active: new Date() })
        .then(({ total, data }) => {
          if (total > 0) {
            const officer = data[0];
            return bot.replyPrivate(message, `The current ${officer.title} is ${officer.user.firstName} ${officer.user.lastName}.`);
          }
          return bot.replyPrivate(message, 'Not a valid position.');
        });
    }
  },
};

MatcherRegister.registerSlash(matcher);
