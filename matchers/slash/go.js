'use strict';

import MatcherRegister from '../../matcher-register';
import getAPI from '../../api';
import { slushbot } from '../../bot';
import nconf from '../../config';

const matcher = {
  name: 'go',
  help: {
    '/sse go [short_link] [url]': 'create a new short link to the given url',
  },

  match(bot, message) {
    const api = getAPI();
    const { Links, Auth } = api;

    const matchCommand = message.text.match(/go (.+) (.+)/);

    if (matchCommand) {
      const linkParams = {
        shortLink: matchCommand[1],
        longLink: matchCommand[2],
      };

      // The slash command bot does not have the proper permissions to access
      // the slack web api
      slushbot.api.users.info({ user: message.user_id }, (err, res) => {
        if (err) {
          return bot.replyPrivate(message, 'There was an error getting your user information');
        }

        const matchEmail = res.user.profile.email.match(/^([a-z]{2,3}\d{4})@rit\.edu$/);
        if (!matchEmail) {
          return bot.replyPrivate(message, 'Not a valid RIT email. Change your email if you wish to run authed commands');
        }

        Auth
          .getToken('slack', matchEmail[1], nconf.get('SLACK_SECRET'))
          .then(() => Links.create(linkParams))
          .then(body => bot.replyPrivate(message, `go link "${body.shortLink}" successfully created`))
          .catch(e => bot.replyPrivate(message, `an error occurred tryng to make the request - ${e.message}`));
      });
    }
  },
};

MatcherRegister.registerSlash(matcher);
