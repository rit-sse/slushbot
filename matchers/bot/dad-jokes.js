import MatcherRegister from '../../matcher-register';

const matcher = {
  name: 'dad jokes',
  help: {
    "I'm [phrase]": 'Tell a dad joke',
  },

  match(controller) {
    console.log("Init?");
    controller.hears("I['|’]m (.+)", 'ambient', (bot, message) => {
      bot.reply(message, `Hi ${message.match[1]}, I'm Slushbot!`);
    });
  },
};

MatcherRegister.registerBot(matcher);
