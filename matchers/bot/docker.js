import MatcherRegister from '../../matcher-register';
import redis from 'redis';
import nconf from '../../config';

let client = redis.createClient('redis://' + nconf.get('REDIS_PORT_6379_TCP_ADDR') + ':6379');

let subs = {};

client.subscribe('dockerbuilds');
client.on("message", (chan, msg) => {
  for(let key in subs) {
    subs[key].reply({ channel: key }, msg);
  }
});

const matcher = {
  name: 'docker',
  help: {
    "docker": "notify build"
  },

  subscribe(bot, message) {
    // Probably a memory retention problem...
    subs[message.channel] = bot; 
  },

  match(controller) {
    controller.hears("docker notify build", 'ambient', (bot, message) => {
      bot.reply(message, "Notifications for docker builds are on for this channel");
      this.subscribe(bot, message);
    });
  },
};

MatcherRegister.registerBot(matcher);
