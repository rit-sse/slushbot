import MatcherRegister from '../../matcher-register';
import redis from 'redis';
import nconf from '../../config';

let client = redis.createClient('redis://' + nconf.get('REDIS_PORT_6379_TCP_ADDR') + ':6379');

let subs = {};

client.on("message", (chan, msg) => {
  for(let key in subs) {
    subs[key].reply({ channel: key }, chan + ": " + msg);
  }
});

const matcher = {
  name: 'docker',
  help: {
    "docker": "notify build"
  },

  subscribe(bot, message, channel) {
    // Probably a memory retention problem...
    client.subscribe(channel);
    subs[message.channel] = bot; 
  },

  match(controller) {
    controller.hears("tech notify (.+)", 'ambient', (bot, message) => {
      const channel = message.match[1];
      const isBasic = /\w+/;
      const valid = isBasic.exec(channel);
      const isValid = valid[0] === channel; 
      if (isValid) {
        this.subscribe(bot, message, channel);
        bot.reply(message, "neat");
      } else {
        bot.reply(message, "sub channels need to be a single word");
      }
    });
  },
};

MatcherRegister.registerBot(matcher);
