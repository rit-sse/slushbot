import MatcherRegister from '../../matcher-register';

const matcher = {
  name: 'dad jokes',
  help: {
    "I'm [phrase]": 'Tell a dad joke',
  },

  match(controller) {
    controller.hears("I['|’]m (.+)", 'ambient', (bot, message) => {
      const trigger = message.text;
      const words = trigger.split(' ');
      if (words[0] === "I'm") {
        bot.reply(message, `Hi ${message.match[1]}, I'm Slushbot!`);
      }
    });
  },
};

MatcherRegister.registerBot(matcher);
