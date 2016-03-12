import setupMatchers from './matchers';
import Matchers from './matcher-register';
import readline from 'readline';
import chalk from 'chalk';
import nconf from './config';

setupMatchers();

const rl = readline.createInterface(process.stdin, process.stdout);
const bot = {
  replyPrivate(message, string) {
    console.log(chalk.blue(string));
  },
  replyPublic(message, string) {
    console.log(string);
  },
};


console.log(chalk.blue('Private messages are in blue'));
rl.setPrompt('> ');
rl.prompt();

rl
  .on('line', line => {
    const match = line.match(/\/sse (.+)/);
    if (match) {
      const message = {
        user_id: nconf.get('SLACK_USER_ID'), // eslint-disable-line camelcase
        commmand: '/sse',
        text: match[1],
      };

      Object.values(Matchers.slash).forEach(matcher => matcher.match(bot, message));
    } else {
      console.log('I don\'t get it');
    }
    rl.prompt();
  })
  .on('SIGINT', () => rl.close());

