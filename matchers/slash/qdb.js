'use strict';

import MatcherRegister from '../../matcher-register';
import getAPI from '../../api';
import { slushbot } from '../../bot';
import nconf from '../../config';

const matcher = {
  name: 'qdb',
  help: {
    '/sse qdb quote [tag]': 'Return a random quote for a tag',
    '/sse qdb quote #[id]': 'Return a specific quote',
    '/sse qdb add': 'Add a quote in a private conversation with slushbot',
    '/sse qdb qpprove': 'Approve quotes in a private conversation with slushbot',
  },

  match(bot, message) {
    const api = getAPI();
    const { Quotes, Auth } = api;

    const matchCommand = message.text.match(/qdb (quote|add|approve)\s?(.*)/);

    if (matchCommand) {
      const [, subcommand, commandArgs] = matchCommand;
      if (subcommand === 'quote') {
        const argMatch = commandArgs.match(/#(\d+)|(\w+)/);
        if (argMatch) {
          if (argMatch[1]) {
            return Quotes
              .one(argMatch[1])
              .then(quote => bot.replyPublic(message, `> ${quote.body.replace(/\r\n|\r|\n/g, '\n>')}`))
              .catch(err => bot.replyPrivate(message, `There was an error getting the quote - ${err.message}`));
          }
          return Quotes
            .all({ tag: argMatch[2] }, true)
            .then(quotes => {
              if (quotes.length === 0) {
                return Promise.reject({ message: 'No quotes with that tag exist' });
              }
              const quote = quotes[Math.floor(Math.random()*quotes.length)];
              return bot.replyPublic(message, `> ${quote.body.replace(/\r\n|\r|\n/g, '\n>')}`);
            })
            .catch(err => bot.replyPrivate(message, `There was an error getting a quote - ${err.message}`));
        }
        return bot.replyPrivate(message, 'Invalid qdb command - run /sse help qdb for detailed usage');
      }
      slushbot.api.users.info({ user: message.user_id }, (err, res) => {
        if (err) {
          return bot.replyPrivate(message, 'There was an error getting your user information');
        }

        const matchEmail = res.user.profile.email.match(/^([a-z]{2,3}\d{4})@rit\.edu$/);
        if (!matchEmail) {
          return bot.replyPrivate(message, 'Not a valid RIT email. Change your email if you wish to run authed commands');
        }

        Auth
          .getToken('slack', matchEmail[1], nconf.get('SLACK_SECRET'));
      });
    }
  },
};

MatcherRegister.registerSlash(matcher);
