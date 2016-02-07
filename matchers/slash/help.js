'use strict';

import MatcherRegister from '../../matcher-register';

const matcher = {
  name: 'help',
  help: {
    '/sse help': 'list all the help commnds',
    '/sse help [command]': 'list help commands for a specific command',
  },

  match(bot, message) {
    const match = message.text.match(/help(.*)/);
    if (match) {
      if (!match[1]) {
        let helpText = Object.values(MatcherRegister.slash).reduce((string, m) => {
          let str = string;
          Object.entries(m.help).forEach(entry => str += `*${entry[0]}* - ${entry[1]}\n`);
          return str;
        }, '');
        helpText += '---\n';
        helpText += Object.values(MatcherRegister.bot).reduce((string, m) => {
          let str = string;
          Object.entries(m.help).forEach(entry => str += `*${entry[0]}* - ${entry[1]}\n`);
          return str;
        }, '');
        bot.replyPrivate(message, helpText);
      } else {
        const m = MatcherRegister.slash[match[1].trim().toLowerCase()] || MatcherRegister.bot[match[1].trim().toLowerCase()];
        if (m) {
          const helpText = Object.entries(m.help).reduce((str, entry) => str + `*${entry[0]}* - ${entry[1]}\n`, '');
          bot.replyPrivate(message, helpText);
        } else {
          bot.replyPrivate(message, `No help information for *${match[1]}*. Try /sse help for all help information`);
        }
      }
    }
  },
};

MatcherRegister.registerSlash(matcher);
