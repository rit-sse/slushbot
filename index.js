'use strict';

import Botkit from 'botkit';
import redisStore from './storage/redis';
import Matchers from './src/matcher-register';
import setupMatchers from './src/matchers';

if (!process.env.SLACK_TOKEN) {
  throw new Error('Error: Specify token in environment');
}

setupMatchers();

const controller = Botkit.slackbot({
  debug: false,
  storage: redisStore({ url: process.env.REDIS_URL }),
});

const slushbot = controller.spawn({ token: process.env.SLACK_TOKEN });

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

controller.setupWebserver(process.env.port || 3000, (err, expressWebserver) => {
  if (err) {
    throw new Error(err);
  }

  controller.createWebhookEndpoints(expressWebserver);
});

controller.on('slash_command', (bot, message) => Object.values(Matchers.slash).forEach(matcher => matcher.match(bot, message)));

Object.values(Matchers.bot).forEach(matcher => matcher.match(controller));

export default controller;
