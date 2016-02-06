'use strict';

import Botkit from 'botkit';
import redisStore from './storage/redis';
import Matchers from './src/matcher-register';
import setupMatchers from './src/matchers';
import nconf from './config';

if (!nconf.get('SLACK_BOT_TOKEN') || !nconf.get('SLACK_SLASH_TOKEN')) {
  throw new Error('Error: Specify slack tokens in environment');
}

setupMatchers();

const controller = Botkit.slackbot({
  debug: false,
  storage: redisStore({ url: nconf.get('REDIS_URL') }),
});

const slushbot = controller.spawn({ token: nconf.get('SLACK_BOT_TOKEN') });

slushbot.api.team.info({}, (err, res) => {
  if (err) {
    throw new Error(err);
  }

  controller.saveTeam(res.team, () => controller.log('Stored Team Information'));
});

slushbot.startRTM(err => {
  if (err) {
    throw new Error(err);
  }
});

controller.setupWebserver(nconf.get('PORT') || 3000, (err, expressWebserver) => {
  if (err) {
    throw new Error(err);
  }

  controller.createWebhookEndpoints(expressWebserver);
});

controller.on('slash_command', (bot, message) => {
  if (message.token === nconf.get('SLACK_SLASH_TOKEN')) {
    Object.values(Matchers.slash).forEach(matcher => matcher.match(bot, message));
  }
});

Object.values(Matchers.bot).forEach(matcher => matcher.match(controller));

export default controller;
